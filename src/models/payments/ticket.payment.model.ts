import { InferSchemaType, Schema } from "mongoose";
import Payment, { IPayment } from "./payment.model";
import Refund from "./refund.model";

const ticketPaymentSchema = new Schema({
  event: {
    type: Schema.Types.ObjectId,
    ref: "Event",
    required: true,
  },
  tickets: [
    {
      cat: {
        type: String,
        required: true,
      },
      quantity: {
        type: Number,
        required: true,
      },
      price: {
        type: Number,
        required: true,
      },
    },
  ],
});

ticketPaymentSchema.virtual("refund").get(async function () {
  const payment = this as ITicketPayment;
  const refund = await Refund.findOne({
    $or: [{ payment: payment._id }, { paymentIntent: payment.paymentIntent }],
  });
  return refund;
});

export interface ITicketPayment
  extends IPayment,
    InferSchemaType<typeof ticketPaymentSchema> {
  refund: InstanceType<typeof Refund> | null;
}

const TicketPayment = Payment.discriminator<ITicketPayment>(
  "TicketPayment",
  ticketPaymentSchema
);

export default TicketPayment;
