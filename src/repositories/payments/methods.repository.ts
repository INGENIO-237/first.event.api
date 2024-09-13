import { Service } from "typedi";
import { RegisterPaymentMethod } from "../../schemas/payments/methods.schemas";
import PaymentMethod from "../../models/payments/methods.model";
import { Types } from "mongoose";

@Service()
export default class PaymentMethodRepo {
  async registerPaymentMethod(
    payload: RegisterPaymentMethod["body"] & { user: string }
  ) {
    return await PaymentMethod.create(payload);
  }

  async getUserPaymentMethods(userId: string) {
    return PaymentMethod.find({ user: new Types.ObjectId(userId) });
  }
}
