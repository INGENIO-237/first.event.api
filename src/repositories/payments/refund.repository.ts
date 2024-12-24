import { Service } from "typedi";
import { CreateRefund } from "../../schemas/payments/refund.schemas";
import Refund from "../../models/payments/refund.model";
import { PAYMENT_STATUS } from "../../utils/constants/payments-and-subs";
import { Types } from "mongoose";

@Service()
export default class RefundRepo {
  async createRefund(payload: CreateRefund & { fees: number }) {
    return await Refund.create({
      billing: { sameAsProfile: true },
      shipping: { sameAsProfile: true },
      ...payload,
    });
  }

  async getRefund({
    refundId,
    paymentIntent,
  }: {
    refundId?: string;
    paymentIntent?: string;
  }) {
    return await Refund.findOne({
      $or: [{ _id: new Types.ObjectId(refundId) }, { paymentIntent }],
    });
  }

  // TODO: Get list of refunds
  async updateRefund({
    refundId,
    paymentIntent,
    status,
    failMessage,
  }: {
    refundId?: string;
    paymentIntent?: string;
    status: PAYMENT_STATUS;
    failMessage?: string;
  }) {
    await Refund.findOneAndUpdate(
      { $or: [{ _id: new Types.ObjectId(refundId) }, { paymentIntent }] },
      { status, failMessage }
    );
  }
}
