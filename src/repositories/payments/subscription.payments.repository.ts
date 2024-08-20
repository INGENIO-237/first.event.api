import { Service } from "typedi";
import { SubscriptionPaymentPayload } from "../../schemas/subs/subscription.schemas";
import SubscriptionPayment from "../../models/payments/subscription.payment.model";

@Service()
export default class SubscriptionPaymentRepo {
  async createSubscriptionPayment(payload: SubscriptionPaymentPayload) {
    return await SubscriptionPayment.create(payload);
  }
}
