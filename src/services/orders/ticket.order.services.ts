import { Service } from "typedi";
import TicketOrderRepo from "../../repositories/orders/ticket.order.repository";
import { CreateTicketOrderPayload } from "../../schemas/orders/ticket.order.schemas";
import Event from "../../models/events/event.model";

@Service()
export default class TicketOrderServices {
  constructor(private readonly ticketOrderRepo: TicketOrderRepo) {}

  async createTicketOrder(data: CreateTicketOrderPayload) {
    const { event } = data;

    await Event.checkValidity(event);

    return await this.ticketOrderRepo.createTicketOrder(data);
  }
}
