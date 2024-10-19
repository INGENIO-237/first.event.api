import { Service } from "typedi";
import {
  CreateTicketOrderPayload,
  UpdateTicketOrderInput,
} from "../../schemas/orders/ticket.order.schemas";
import TicketOrder from "../../models/orders/ticket.order.model";

@Service()
export default class TicketOrderRepo {
  async createTicketOrder(ticketOrder: CreateTicketOrderPayload) {
    return await TicketOrder.create(ticketOrder);
  }

  async getTicketOrder({ ticketOrder }: { ticketOrder: string }) {
    return await TicketOrder.findById(ticketOrder);
  }

  async updateTicketOrder({
    ticketOrder,
    update,
  }: {
    ticketOrder: string;
    update: UpdateTicketOrderInput["body"];
  }) {
    return await TicketOrder.findByIdAndUpdate(ticketOrder, update);
  }
}
