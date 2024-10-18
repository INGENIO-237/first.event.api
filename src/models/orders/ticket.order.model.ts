import { InferSchemaType, Schema } from "mongoose";
import Order, { IOrder } from "./order.model";

const ticketOrderSchema = new Schema({
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

export interface ITicketOrder
  extends IOrder,
    InferSchemaType<typeof ticketOrderSchema> {}

const TicketOrder = Order.discriminator<ITicketOrder>(
  "TicketOrder",
  ticketOrderSchema
);

export default TicketOrder;
