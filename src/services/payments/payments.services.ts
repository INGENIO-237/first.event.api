import Stripe from "stripe";
import { Service } from "typedi";
import StripeServices from "./stripe.services";
import SubscriptionPaymentServices from "./subscription.payments.services";
import { PAYMENT_TYPE } from "../../utils/constants/common";
import {
  PAYMENT_STATUS,
  PAYMENT_TYPE_PREDICTION,
  PAYMENT_ACTIONS,
} from "../../utils/constants/plans-and-subs";
import logger from "../../utils/logger";
import { RegisterSubscription } from "../../schemas/subs/subscription.schemas";
import PaymentsHooks from "../../hooks/payments.hooks";

@Service()
export default class PaymentsServices {
  constructor(
    private stripe: StripeServices,
    private subscriptionPaymentService: SubscriptionPaymentServices,
    private paymentHooks: PaymentsHooks
  ) {}

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

  // Events
  // Tickets

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
    let refundId;

    if (paymentType === PAYMENT_TYPE.SUBSCRIPTION)
      refundId =
        await this.subscriptionPaymentService.refundSubscriptionPayment({
          paymentId,
          amount,
        });

    return refundId;
  }

  async handleWebhook(signature: string | string[], data: string | Buffer) {
    const event = this.stripe.constructEvent({ signature, data });

    const { type: eventType } = event;

    const paymentIntent = (event.data.object as Stripe.Charge)
      .payment_intent as string;

    const { type: paymentType } = (await this.predictPaymentType({
      paymentIntent,
    })) as PAYMENT_TYPE_PREDICTION;

    if (eventType === "charge.captured" || eventType === "charge.succeeded") {
      const receipt = event.data.object.receipt_url as string;

      await this.handleSuccessfullPayment({
        paymentIntent,
        receipt,
        paymentType,
      });
    }

    if (eventType === "charge.expired" || eventType === "charge.failed") {
      const { failure_message: failMessage } = event.data.object;

      await this.handleFailedPayment({
        paymentIntent,
        failMessage: failMessage as string,
      });
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
    }
    // TODO: Add for tickets and articles too
  }

  async handleSuccessfullPayment({
    paymentIntent,
    receipt,
    paymentType,
  }: {
    paymentIntent: string;
    receipt: string;
    paymentType: PAYMENT_TYPE;
  }) {
    switch (paymentType) {
      case PAYMENT_TYPE.SUBSCRIPTION:
        await this.subscriptionPaymentService.updateSubscriptionPayment({
          paymentIntent,
          status: PAYMENT_STATUS.SUCCEEDED,
          receipt,
        });

        this.paymentHooks.emit(
          PAYMENT_ACTIONS.SUBSCRIPTION_SUCCEEDED,
          paymentIntent
        );
        break;

      default:
        logger.error("Invalid payment type");
        break;
    }
  }

  async handleFailedPayment({
    paymentIntent,
    failMessage,
  }: {
    paymentIntent: string;
    failMessage: string;
  }) {
    await this.subscriptionPaymentService.updateSubscriptionPayment({
      paymentIntent,
      failMessage,
      status: PAYMENT_STATUS.FAILED,
    });
  }
}
