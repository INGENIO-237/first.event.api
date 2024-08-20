import { Service } from "typedi";
import SubscriptionPaymentRepo from "../../repositories/payments/subscription.payments.repository";
import { RegisterSubscription } from "../../schemas/subs/subscription.schemas";
import StripeServices from "./stripe.services";
import { PlanServices } from "../subs";
import { IPlan } from "../../models/subs/plan.model";
import { BILLING_TYPE } from "../../utils/constants/plans-and-subs";

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

    let amount;
    // TODO: Get plan and price
    const { monthlyPrice, yearlyPrice } = (await this.planService.getPlan(
      plan,
      true
    )) as IPlan;

    amount = billed == BILLING_TYPE.MONTHLY ? monthlyPrice : yearlyPrice * 12;

    // TODO: Apply coupons if any
    // TODO: Apply taxes
    // TODO: Create payment intent
    const { paymentIntent, ephemeralKey, clientSecret } =
      await this.stripe.initiatePayment({ amount });

    // TODO: Persist to DB

    return { paymentIntent, ephemeralKey, clientSecret };
  }
}
