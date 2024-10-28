import { Service } from "typedi";
import TicketOrderServices from "../../services/orders/ticket.order.services";
import { Request, Response } from "express";
import {
  CreateTicketOrderInput,
  GetTicketOrdersInput,
} from "../../schemas/orders/ticket.order.schemas";
import HTTP from "../../utils/constants/http.responses";

@Service()
export default class TicketOrderController {
  constructor(private readonly service: TicketOrderServices) {}

  async createTicketOrder(
    req: Request<{}, {}, CreateTicketOrderInput["body"]>,
    res: Response
  ) {
    const { id } = (req as any).user;

    const ticketOrder = await this.service.createTicketOrder({
      ...req.body,
      user: id,
    });

    return res.status(HTTP.CREATED).json(ticketOrder);
  }

  async getTicketOrders(
    req: Request<{}, {}, {}, GetTicketOrdersInput["query"]>,
    res: Response
  ) {
    const { id } = (req as any).user;

    const ticketOrders = await this.service.getTicketOrders({
      ...req.query,
      user: id,
    });

    return res.status(HTTP.OK).json(ticketOrders);
  }

  async getTicketOrder(req: Request<{ order: string }>, res: Response) {
    const ticketOrder = await this.service.getTicketOrder({
      ticketOrder: req.params.order,
    });

    return res.status(HTTP.OK).json(ticketOrder);
  }
}
