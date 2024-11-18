import { Service } from "typedi";
import { SubscriptionPaymentPayload } from "../../schemas/subs/subscription.schemas";
import SubscriptionPayment from "../../models/payments/subscription.payment.model";
import { Types } from "mongoose";
import { PAYMENT_STATUS } from "../../utils/constants/payments-and-subs";

@Service()
export default class SubscriptionPaymentRepo {
  async getSubscriptionPayments({ user }: { user: string }) {
    return await SubscriptionPayment.find({ user });
  }

  async createSubscriptionPayment(
    payload: SubscriptionPaymentPayload & { fees: number }
  ) {
    return await SubscriptionPayment.create(payload);
  }

  async getSubscriptionPayment({
    paymentId,
    paymentIntent,
    user,
  }: {
    paymentId?: string;
    paymentIntent?: string;
    user?: string;
  }) {
    return await SubscriptionPayment.findOne({
      $or: [
        { _id: new Types.ObjectId(paymentId) },
        { paymentIntent },
        { user: new Types.ObjectId(user) },
      ],
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
    await SubscriptionPayment.findOneAndUpdate(
      { $or: [{ _id: new Types.ObjectId(paymentId) }, { paymentIntent }] },
      { status, receipt, failMessage }
    );
  }
}
