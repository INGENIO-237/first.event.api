import { InferSchemaType, Model, Schema } from "mongoose";
import Order, { IOrder } from "./order.model";
import ApiError from "../../utils/errors/errors.base";
import HTTP from "../../utils/constants/http.responses";
import Event, { IEvent } from "../events/event.model";

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

ticketOrderSchema.statics.checkValidity = async function (orderId: string) {
  const order = await this.findById(orderId);
  if (!order) {
    throw new ApiError(HTTP.NOT_FOUND, "Commande inéxistante");
  }

  const event = await Event.checkValidity(order.event as string);

  order.event = event as IEvent;

  return order as ITicketOrder & { event: IEvent };
};

interface TicketModel extends Model<ITicketOrder> {
  checkValidity: (orderId: string) => Promise<ITicketOrder & { event: IEvent }>;
}

const TicketOrder = Order.discriminator<ITicketOrder, TicketModel>(
  "TicketOrder",
  ticketOrderSchema
);

export default TicketOrder;
