import EventEmitter from "node:events";
import Stripe from "stripe";
import { Service } from "typedi";
import EventBus from "../../hooks/event-bus";
import Refund, { IRefund } from "../../models/payments/refund.model";
import { CreateProductPaymentPayload } from "../../schemas/payments/product.payment.schemas";
import { CreateTicketPaymentPayload } from "../../schemas/payments/ticket.payment.schemas";
import { RegisterSubscription } from "../../schemas/subs/subscription.schemas";
import { PAYMENT_TYPE } from "../../utils/constants/common";
import {
  PAYMENT_ACTIONS,
  PAYMENT_TYPE_PREDICTION,
  REFUND_TYPES,
  STRIPE_EVENT_TYPES,
} from "../../utils/constants/plans-and-subs";
import logger from "../../utils/logger";
import {
  ProductPaymentServices,
  SubscriptionPaymentServices,
  TicketPaymentServices,
} from "./core";
import StripeServices from "./stripe.services";

@Service()
export default class PaymentsServices {
  private emitter: EventEmitter;

  constructor(
    private stripe: StripeServices,
    private subscriptionPaymentService: SubscriptionPaymentServices,
    private ticketPaymentService: TicketPaymentServices,
    private productPaymentService: ProductPaymentServices
  ) {
    this.emitter = EventBus.getEmitter();
  }

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

  async requestTicketPaymentRefund({
    payment,
    user,
  }: {
    payment: string;
    user: string;
  }) {
    await this.ticketPaymentService.requestTicketPaymentRefund({
      payment,
      user,
    });
  }

  // Product
  async initiateProductPayment(data: CreateProductPaymentPayload) {
    return await this.productPaymentService.createProductPayment(data);
  }

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

    switch (paymentType) {
      case PAYMENT_TYPE.TICKET:
        const {
          id: ticketRefundId,
          acquirerReferenceNumber: ticketAcquirerReferenceNumber,
        } = (await this.ticketPaymentService.refundTicketPayment({
          paymentId,
          amount,
        })) as { id: string; acquirerReferenceNumber: string };
        rfId = ticketRefundId;
        acquirer = ticketAcquirerReferenceNumber;
        break;

      // case PAYMENT_TYPE.PRODUCT:
      //   const { id: prodId, acquirerReferenceNumber: prodAcquirer } =
      //     (await this.productPaymentService.refundProductPayment({
      //       paymentId,
      //       amount,
      //     })) as { id: string; acquirerReferenceNumber: string };
      //   rfId = prodId;
      //   acquirer = prodAcquirer;
      //   break;
      default:
        const { id, acquirerReferenceNumber } =
          (await this.subscriptionPaymentService.refundSubscriptionPayment({
            paymentId,
            amount,
          })) as { id: string; acquirerReferenceNumber: string };
        rfId = id;
        acquirer = acquirerReferenceNumber;
        break;
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
      const { type: paymentType, refundType } = (await this.predictPaymentType({
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

    const ticketPayment = await this.ticketPaymentService.getTicketPayment({
      paymentIntent,
      paymentId,
    });

    const productPayment = await this.productPaymentService.getProductPayment({
      paymentIntent,
      paymentId,
    });

    if (subscriptionPayment) {
      const { paymentIntent } = subscriptionPayment;
      return { type: PAYMENT_TYPE.SUBSCRIPTION, paymentIntent };
    }

    if (ticketPayment) {
      const { paymentIntent } = ticketPayment;
      return { type: PAYMENT_TYPE.TICKET, paymentIntent };
    }

    if (productPayment) {
      const { paymentIntent } = productPayment;
      return { type: PAYMENT_TYPE.PRODUCT, paymentIntent };
    }

    return { type: PAYMENT_TYPE.REFUND, paymentIntent };
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
      case PAYMENT_TYPE.TICKET:
        this.emitter.emit(PAYMENT_ACTIONS.TICKET_PAYMENT_SUCCEEDED, {
          paymentIntent,
          receipt,
        });
        break;
      case PAYMENT_TYPE.PRODUCT:
        this.emitter.emit(PAYMENT_ACTIONS.PRODUCT_PAYMENT_SUCCEEDED, {
          paymentIntent,
          receipt,
        });
        break;
      case PAYMENT_TYPE.REFUND:
        const { refundType } = (await Refund.findOne({
          paymentIntent,
        })) as IRefund;

        if (refundType === REFUND_TYPES.SUBSCRIPTION) {
          this.emitter.emit(PAYMENT_ACTIONS.REFUND_SUB_SUCCEEDED, {
            paymentIntent,
          });
        }

        if (refundType === REFUND_TYPES.TICKET) {
          this.emitter.emit(PAYMENT_ACTIONS.REFUND_TICKET_SUCCEEDED, {
            paymentIntent,
          });
        }

        // if (refundType === REFUND_TYPES.PRODUCT) {
        //   this.emitter.emit(PAYMENT_ACTIONS.REFUND_PRODUCT_SUCCEEDED, {
        //     paymentIntent,
        //   });
        // }
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
      case PAYMENT_TYPE.TICKET:
        this.emitter.emit(PAYMENT_ACTIONS.TICKET_PAYMENT_FAILED, {
          paymentIntent,
          failMessage,
        });
        break;
      case PAYMENT_TYPE.REFUND:
        const { refundType } = (await Refund.findOne({
          paymentIntent,
        })) as IRefund;

        if (refundType === REFUND_TYPES.SUBSCRIPTION) {
          this.emitter.emit(PAYMENT_ACTIONS.REFUND_SUB_FAILED, {
            paymentIntent,
            failMessage,
          });
        }

        if (refundType === REFUND_TYPES.TICKET) {
          this.emitter.emit(PAYMENT_ACTIONS.REFUND_TICKET_FAILED, {
            paymentIntent,
            failMessage,
          });
        }

      default:
        logger.error("Invalid payment type");
        break;
    }
  }
}
