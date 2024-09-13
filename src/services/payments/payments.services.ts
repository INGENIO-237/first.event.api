import Stripe from "stripe";
import { Service } from "typedi";
import StripeServices from "./stripe.services";
import SubscriptionPaymentServices from "./subscription.payments.services";
import { PAYMENT_TYPE } from "../../utils/constants/common";
import {
  PAYMENT_TYPE_PREDICTION,
  PAYMENT_ACTIONS,
} from "../../utils/constants/plans-and-subs";
import logger from "../../utils/logger";
import { RegisterSubscription } from "../../schemas/subs/subscription.schemas";
import EventBus from "../../hooks/event-bus";
import EventEmitter from "node:events";

@Service()
export default class PaymentsServices {
  private emitter: EventEmitter;

  constructor(
    private stripe: StripeServices,
    private subscriptionPaymentService: SubscriptionPaymentServices
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

  // TODO: Events
  // TODO: Tickets

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

    if (paymentIntent) {
      const { type: paymentType } = (await this.predictPaymentType({
        paymentIntent,
      })) as PAYMENT_TYPE_PREDICTION;

      if (eventType === "charge.captured" || eventType === "charge.succeeded") {
        const receipt = (event.data.object.receipt_url as string) ?? undefined;

        await this.handleSuccessfullPayment({
          paymentIntent,
          receipt,
          paymentType,
        });
      }

      if (eventType === "charge.refunded") {
        await this.handleSuccessfullPayment({
          paymentIntent,
          paymentType: PAYMENT_TYPE.REFUND,
        });
      }

      if (eventType === "charge.expired" || eventType === "charge.failed") {
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
