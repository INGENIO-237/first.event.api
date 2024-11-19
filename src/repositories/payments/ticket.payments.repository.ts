import { Service } from "typedi";
import { TicketPaymentPayload } from "../../schemas/payments/ticket.payment.schemas";
import TicketPayment from "../../models/payments/ticket.payment.model";
import { Types } from "mongoose";
import { PAYMENT_STATUS } from "../../utils/constants/payments-and-subs";

@Service()
export default class TicketPaymentRepo {
  async createTicketPayment(payload: TicketPaymentPayload) {
    return await TicketPayment.create(payload);
  }

  async getTicketPayment({
    paymentIntent,
    paymentId,
  }: {
    paymentIntent?: string;
    paymentId?: string;
  }) {
    return await TicketPayment.findOne({
      $or: [{ paymentIntent }, { _id: new Types.ObjectId(paymentId) }],
    });
  }

  async updateTicketPayment({
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
    await TicketPayment.findOneAndUpdate(
      { $or: [{ _id: new Types.ObjectId(paymentId) }, { paymentIntent }] },
      { status, receipt, failMessage }
    );
  }
}
