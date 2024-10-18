import { InferSchemaType, Schema } from "mongoose";
import Payment, { IPayment } from "./payment.model";

const ticketPaymentSchema = new Schema({
  ticketOrder: {
    type: Schema.Types.ObjectId,
    ref: "TicketOrder",
    required: true,
  },
});

export interface ITicketPayment
  extends IPayment,
    InferSchemaType<typeof ticketPaymentSchema> {}

const TicketPayment = Payment.discriminator<ITicketPayment>(
  "TicketPayment",
  ticketPaymentSchema
);

export default TicketPayment;
