import { Service } from "typedi";
import {
  CreateTicketOrderPayload,
  UpdateTicketOrderInput,
  UpdateTicketOrderPayload,
} from "../../schemas/orders/ticket.order.schemas";
import TicketOrder from "../../models/orders/ticket.order.model";
import { Types } from "mongoose";
import { PAYMENT_STATUS } from "../../utils/constants/plans-and-subs";

@Service()
export default class TicketOrderRepo {
  async createTicketOrder(ticketOrder: CreateTicketOrderPayload) {
    return await TicketOrder.create(ticketOrder);
  }

  async getTicketOrder({ ticketOrder }: { ticketOrder: string }) {
    return await TicketOrder.findById(ticketOrder);
  }

  async getTicketOrders({ event }: { event: string }) {
    return await TicketOrder.find({ event: new Types.ObjectId(event) });
  }

  async updateTicketOrder({
    ticketOrder,
    ...update
  }: UpdateTicketOrderPayload) {
    return await TicketOrder.findByIdAndUpdate(ticketOrder, update);
  }
}
