import { Service } from "typedi";
import SubscriptionPaymentRepo from "../../repositories/payments/subscription.payments.repository";
import { RegisterSubscription } from "../../schemas/subs/subscription.schemas";

@Service()
export default class SubscriptionPaymentServices {
  constructor(private repository: SubscriptionPaymentRepo) {}

  async createSubscriptionPayment(
    payload: RegisterSubscription["body"] & { user: string }
  ) {
    // TODO: Create payment intent
    // TODO: Apply coupons if any
    // TODO: Apply taxes

    // TODO: Persist to DB

    return { paymentIntent: "" };
  }
}
