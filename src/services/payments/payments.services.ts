import Stripe from "stripe";
import { Service } from "typedi";
import StripeServices from "./stripe.services";
import SubscriptionPaymentServices from "./subscription.payments.services";
import { PAYMENT_TYPE } from "../../utils/constants/common";
import { PAYMENT_STATUS } from "../../utils/constants/plans-and-subs";
import logger from "../../utils/logger";
import { RegisterSubscription } from "../../schemas/subs/subscription.schemas";

@Service()
export default class PaymentsServices {
  constructor(
    private stripe: StripeServices,
    private subscriptionPaymentService: SubscriptionPaymentServices
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

  async handleWebhook(signature: string | string[], data: string | Buffer) {
    const event = this.stripe.constructEvent({ signature, data });

    console.log({ event });

    const { type: eventType } = event;

    if (eventType) {
    }

    const paymentIntent = (event.data.object as Stripe.Charge)
      .payment_intent as string;
    const paymentType = (await this.predictPaymentType(
      paymentIntent
    )) as PAYMENT_TYPE;

    console.log({ paymentIntent });

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

  private async predictPaymentType(paymentIntent: string) {
    const subscriptionPayment =
      await this.subscriptionPaymentService.getSubscriptionPayment({
        paymentIntent,
      });

    if (subscriptionPayment) return PAYMENT_TYPE.SUBSCRIPTION;
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
        // TODO: Create related subscription
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
