import { InferSchemaType, Schema } from "mongoose";
import Payment, { IPayment } from "./payment.model";

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

export interface ITicketPayment
  extends IPayment,
    InferSchemaType<typeof ticketPaymentSchema> {}

const TicketPayment = Payment.discriminator<ITicketPayment>(
  "TicketPayment",
  ticketPaymentSchema
);

export default TicketPayment;
