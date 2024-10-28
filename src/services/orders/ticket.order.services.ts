import { Service } from "typedi";
import TicketOrderRepo from "../../repositories/orders/ticket.order.repository";
import {
  CreateTicketOrderPayload,
  GetTicketOrdersPayload,
  UpdateTicketOrderPayload,
} from "../../schemas/orders/ticket.order.schemas";
import Event from "../../models/events/event.model";
import ApiError from "../../utils/errors/errors.base";
import HTTP from "../../utils/constants/http.responses";

@Service()
export default class TicketOrderServices {
  constructor(private readonly repository: TicketOrderRepo) {}

  async createTicketOrder(data: CreateTicketOrderPayload) {
    const { event } = data;

    const { tickets } = await Event.checkValidity(event);

    const matchingTickets = this.getTicketPrice(tickets, data.tickets);

    if (matchingTickets.length === 0)
      throw new ApiError(HTTP.NOT_FOUND, "Aucun billet trouvé");
    if (matchingTickets.length !== data.tickets.length)
      throw new ApiError(HTTP.BAD_REQUEST, "Un ou plusieurs billets invalides");

    data.tickets = matchingTickets;

    return await this.repository.createTicketOrder(data);
  }

  private getTicketPrice(
    tickets: { cat: string; price: number }[],
    userTickets: { cat: string; quantity: number }[]
  ) {
    const matchingTickets: {
      cat: string;
      price: number;
      quantity: number;
    }[] = [];

    userTickets.forEach((ticket) => {
      const foundTicket = tickets.find(
        (t) => t.cat.toLowerCase() === ticket.cat.toLowerCase()
      );

      if (foundTicket) {
        matchingTickets.push({
          cat: foundTicket.cat,
          price: foundTicket.price,
          quantity: ticket.quantity,
        });
      }
    });

    return matchingTickets;
  }

  async getTicketOrder({
    ticketOrder,
    raiseException = true,
  }: {
    ticketOrder: string;
    raiseException?: boolean;
  }) {
    const order = await this.repository.getTicketOrder({ ticketOrder });

    if (!order && raiseException) {
      throw new ApiError(HTTP.NOT_FOUND, "Commande inéxistante");
    }

    return order;
  }

  async getTicketOrders(payload: GetTicketOrdersPayload) {
    const { event, user } = payload;

    await Event.checkOwnership({ event, user });

    return await this.repository.getTicketOrders({ event });
  }

  async updateTicketOrder({
    ticketOrder,
    ...update
  }: UpdateTicketOrderPayload) {
    await this.repository.updateTicketOrder({ ticketOrder, ...update });
  }
}
