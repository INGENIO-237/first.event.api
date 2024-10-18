import { Service } from "typedi";
import { CreateTicketOrderPayload } from "../../schemas/orders/ticket.order.schemas";
import TicketOrder from "../../models/orders/ticket.order.model";

@Service()
export default class TicketOrderRepo {
  async createTicketOrder(ticketOrder: CreateTicketOrderPayload) {
    return await TicketOrder.create(ticketOrder);
  }
}
