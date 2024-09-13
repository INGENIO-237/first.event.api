import { Service } from "typedi";
import { RegisterPaymentMethod } from "../../schemas/payments/methods.schemas";
import PaymentMethodRepo from "../../repositories/payments/methods.repository";

@Service()
export default class PaymentMethodService {
  constructor(private repository: PaymentMethodRepo) {}

  async registerPaymentMethod(
    payload: RegisterPaymentMethod["body"] & { user: string }
  ) {
    return await this.repository.registerPaymentMethod(payload);
  }
}
