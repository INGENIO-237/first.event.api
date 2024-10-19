import { Service } from "typedi";
import TicketOrderRepo from "../../repositories/orders/ticket.order.repository";
import {
  CreateTicketOrderPayload,
  UpdateTicketOrderInput,
} from "../../schemas/orders/ticket.order.schemas";
import Event from "../../models/events/event.model";
import ApiError from "../../utils/errors/errors.base";
import HTTP from "../../utils/constants/http.responses";

@Service()
export default class TicketOrderServices {
  constructor(private readonly ticketOrderRepo: TicketOrderRepo) {}

  async createTicketOrder(data: CreateTicketOrderPayload) {
    const { event } = data;

    await Event.checkValidity(event);

    return await this.ticketOrderRepo.createTicketOrder(data);
  }

  async getTicketOrder({
    ticketOrder,
    raiseException = true,
  }: {
    ticketOrder: string;
    raiseException?: boolean;
  }) {
    const order = await this.ticketOrderRepo.getTicketOrder({ ticketOrder });

    if (!order && raiseException) {
      throw new ApiError(HTTP.NOT_FOUND, "Commande inéxistante");
    }

    return order;
  }

  async getTicketOrders({
    ticketOrder,
    update,
  }: {
    ticketOrder: string;
    update: UpdateTicketOrderInput["body"];
  }) {}
}
