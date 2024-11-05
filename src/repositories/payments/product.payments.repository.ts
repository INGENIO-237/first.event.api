import { Service } from "typedi";
import { ProductPaymentPayload } from "../../schemas/payments/product.payment.schemas";
import ProductPayment from "../../models/payments/product.payment.model";
import { Types } from "mongoose";
import { PAYMENT_STATUS } from "../../utils/constants/plans-and-subs";

@Service()
export default class ProductPaymentRepo {
  async createProductPayment(payload: ProductPaymentPayload) {
    return await ProductPayment.create(payload);
  }

  async getProductPayment({
    paymentIntent,
    paymentId,
  }: {
    paymentIntent?: string;
    paymentId?: string;
  }) {
    return await ProductPayment.findOne({
      $or: [{ paymentIntent }, { _id: new Types.ObjectId(paymentId) }],
    });
  }

  async updateProductPayment({
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
    await ProductPayment.findOneAndUpdate(
      { $or: [{ _id: new Types.ObjectId(paymentId) }, { paymentIntent }] },
      { status, receipt, failMessage }
    );
  }
}
