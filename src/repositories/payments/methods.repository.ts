import { Service } from "typedi";
import { RegisterPaymentMethod } from "../../schemas/payments/methods.schemas";
import PaymentMethod from "../../models/payments/methods.model";

@Service()
export default class PaymentMethodRepo {
  async registerPaymentMethod(
    payload: RegisterPaymentMethod["body"] & { user: string }
  ) {
    return await PaymentMethod.create(payload);
  }
}
