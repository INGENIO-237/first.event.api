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

  async getPaymentMethod({
    pmId,
    stripePmId,
  }: {
    pmId?: string;
    stripePmId?: string;
  }) {
    return await PaymentMethod.findOne({
      $or: [
        { _id: new Types.ObjectId(pmId) },
        { paymentMethodId: new Types.ObjectId(stripePmId) },
      ],
    });
  }

  async getUserPaymentMethods(userId: string) {
    return PaymentMethod.find({ user: new Types.ObjectId(userId) });
  }
}
