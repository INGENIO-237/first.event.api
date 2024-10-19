import Stripe from "stripe";
import { Service } from "typedi";
import StripeServices from "./stripe.services";
import {
  PAYMENT_TYPE_PREDICTION,
  PAYMENT_ACTIONS,
  STRIPE_EVENT_TYPES,
} from "../../utils/constants/plans-and-subs";
import logger from "../../utils/logger";
import { RegisterSubscription } from "../../schemas/subs/subscription.schemas";
import EventBus from "../../hooks/event-bus";
import EventEmitter from "node:events";
import SubscriptionPaymentServices from "./core-payments/subscription.payments.services";
import TicketPaymentServices from "./core-payments/ticket.payments.services";
import { PAYMENT_TYPE } from "../../utils/constants/common";
import { CreateTicketPaymentPayload } from "../../schemas/payments/ticket.payment.schemas";

@Service()
export default class PaymentsServices {
  private emitter: EventEmitter;

  constructor(
    private stripe: StripeServices,
    private subscriptionPaymentService: SubscriptionPaymentServices,
    private ticketPaymentService: TicketPaymentServices
  ) {
    this.emitter = EventBus.getEmitter();
  }

  // TODO: When provided with a payment method to use, ensure card is still valid

  // Subscriptions
  async initiateSubscriptionPayment({
    data,
    user,
  }: {
    data: RegisterSubscription["body"];
    user: string;
  }) {
    return await this.subscriptionPaymentService.createSubscriptionPayment({
      ...data,
      user,
    });
  }

  // Tickets
  async initiateTicketPayment(data: CreateTicketPaymentPayload) {
    return await this.ticketPaymentService.createTicketPayment(data);
  }

  // TODO: Product

  // Refunds
  async refundPayment({
    paymentId,
    amount,
    paymentType,
  }: {
    paymentId: string;
    amount: number;
    paymentType: PAYMENT_TYPE;
  }) {
    let rfId, acquirer;

    // TODO: Change this to a switch block
    if (paymentType === PAYMENT_TYPE.SUBSCRIPTION) {
      const { id, acquirerReferenceNumber } =
        (await this.subscriptionPaymentService.refundSubscriptionPayment({
          paymentId,
          amount,
        })) as { id: string; acquirerReferenceNumber: string };
      rfId = id;
      acquirer = acquirerReferenceNumber;
    }

    return { rfId, acquirer };
  }

  async handleWebhook(signature: string | string[], data: string | Buffer) {
    const event = this.stripe.constructEvent({ signature, data });

    const { type: eventType } = event;

    const paymentIntent = (event.data.object as Stripe.Charge)
      .payment_intent as string;

    if (
      paymentIntent &&
      [...Object.values(STRIPE_EVENT_TYPES)].includes(
        eventType as STRIPE_EVENT_TYPES
      )
    ) {
      const { type: paymentType } = (await this.predictPaymentType({
        paymentIntent,
      })) as PAYMENT_TYPE_PREDICTION;

      if (
        eventType === STRIPE_EVENT_TYPES.CHARGE_CAPTURED ||
        eventType === STRIPE_EVENT_TYPES.CHARGE_SUCCEEDED
      ) {
        const receipt = (event.data.object.receipt_url as string) ?? undefined;

        await this.handleSuccessfullPayment({
          paymentIntent,
          receipt,
          paymentType,
        });
      }

      if (eventType === STRIPE_EVENT_TYPES.CHARGE_REFUNDED) {
        await this.handleSuccessfullPayment({
          paymentIntent,
          paymentType: PAYMENT_TYPE.REFUND,
        });
      }

      if (
        eventType === STRIPE_EVENT_TYPES.CHARGE_EXPIRED ||
        eventType === STRIPE_EVENT_TYPES.CHARGE_FAILED
      ) {
        const { failure_message: failMessage } = event.data.object;

        await this.handleFailedPayment({
          paymentIntent,
          failMessage: failMessage as string,
          paymentType,
        });
      }
    }
  }

  async predictPaymentType({
    paymentIntent,
    paymentId,
  }: {
    paymentIntent?: string;
    paymentId?: string;
  }) {
    const subscriptionPayment =
      await this.subscriptionPaymentService.getSubscriptionPayment({
        paymentIntent,
        paymentId,
      });

    if (subscriptionPayment) {
      const { paymentIntent } = subscriptionPayment;
      return { type: PAYMENT_TYPE.SUBSCRIPTION, paymentIntent };
      // TODO: Add for tickets and articles too
    } else {
      return { type: PAYMENT_TYPE.REFUND, paymentIntent };
    }
  }

  private async handleSuccessfullPayment({
    paymentIntent,
    receipt,
    paymentType,
  }: {
    paymentIntent: string;
    receipt?: string;
    paymentType: PAYMENT_TYPE;
  }) {
    switch (paymentType) {
      case PAYMENT_TYPE.SUBSCRIPTION:
        this.emitter.emit(PAYMENT_ACTIONS.SUBSCRIPTION_SUCCEEDED, {
          paymentIntent,
          receipt,
        });
        break;
      case PAYMENT_TYPE.REFUND:
        this.emitter.emit(PAYMENT_ACTIONS.REFUND_SUB_SUCCEEDED, {
          paymentIntent,
        });
        break;
      default:
        logger.error("Invalid payment type");
        break;
    }
  }

  private async handleFailedPayment({
    paymentIntent,
    failMessage,
    paymentType,
  }: {
    paymentIntent: string;
    failMessage?: string;
    paymentType: PAYMENT_TYPE;
  }) {
    switch (paymentType) {
      case PAYMENT_TYPE.SUBSCRIPTION:
        this.emitter.emit(PAYMENT_ACTIONS.SUBSCRIPTION_FAILED, {
          paymentIntent,
          failMessage,
        });
        break;
      case PAYMENT_TYPE.REFUND:
        this.emitter.emit(PAYMENT_ACTIONS.REFUND_SUB_FAILED, {
          paymentIntent,
          failMessage,
        });
      default:
        logger.error("Invalid payment type");
        break;
    }
  }
}
