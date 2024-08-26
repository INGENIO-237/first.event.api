import { Service } from "typedi";
import SubscriptionPaymentRepo from "../../repositories/payments/subscription.payments.repository";
import { RegisterSubscription } from "../../schemas/subs/subscription.schemas";
import StripeServices from "./stripe.services";
import { PlanServices } from "../subs";
import { IPlan } from "../../models/subs/plan.model";
import {
  BILLING_TYPE,
  PAYMENT_STATUS,
} from "../../utils/constants/plans-and-subs";
import { ENV } from "../../utils/constants/common";

@Service()
export default class SubscriptionPaymentServices {
  constructor(
    private repository: SubscriptionPaymentRepo,
    private planService: PlanServices,
    private stripe: StripeServices
  ) {}

  async createSubscriptionPayment(
    payload: RegisterSubscription["body"] & { user: string }
  ) {
    const { plan, coupons, billed } = payload;

    let amount: number;
    // Get plan and price
    const { monthlyPrice, yearlyPrice } = (await this.planService.getPlan(
      plan,
      true
    )) as IPlan;

    amount = billed == BILLING_TYPE.MONTHLY ? monthlyPrice : yearlyPrice * 12;

    // TODO: Apply coupons if any
    // TODO: Apply taxes
    // TODO: Create payment intent
    // TODO: Ensure that current user is an organizer
    // TODO: Ensure that current user doesn't have an ongoing plan
    const { paymentIntent, ephemeralKey, clientSecret, fees } =
      await this.stripe.initiatePayment({ amount });

    // Persist to DB
    await this.repository.createSubscriptionPayment({
      ...payload,
      paymentIntent,
      amount,
      fees,
    });

    // TODO: Dev purpose only
    if (process.env.NODE_ENV !== ENV.PROD) {
      setTimeout(() => {
        this.stripe.confirmPaymentIntent(paymentIntent);
      }, 7000);
    }

    return { paymentIntent, ephemeralKey, clientSecret };
  }

  async getSubscriptionPayment({
    paymentId,
    paymentIntent,
  }: {
    paymentId?: string;
    paymentIntent?: string;
  }) {
    return await this.repository.getSubscriptionPayment({
      paymentId,
      paymentIntent,
    });
  }

  async updateSubscriptionPayment({
    paymentId,
    paymentIntent,
    status,
    receipt,
    failMessage,
  }: {
    paymentId?: string;
    paymentIntent?: string;
    status?: PAYMENT_STATUS;
    receipt?: string;
    failMessage?: string;
  }) {
    await this.repository.updateSubscriptionPayment({
      paymentId,
      paymentIntent,
      status,
      receipt,
      failMessage,
    });
  }
}
