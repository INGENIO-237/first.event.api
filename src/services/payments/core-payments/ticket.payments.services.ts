import { Service } from "typedi";
import TicketPaymentRepo from "../../../repositories/payments/ticket.payments.repository";
import TicketOrder from "../../../models/orders/ticket.order.model";
import TicketOrderServices from "../../orders/ticket.order.services";
import Event from "../../../models/events/event.model";
import { CreateTicketPaymentPayload } from "../../../schemas/payments/ticket.payment.schemas";
import { PAYMENT_STATUS } from "../../../utils/constants/plans-and-subs";

@Service()
export default class TicketPaymentServices {
  constructor(
    private readonly repository: TicketPaymentRepo,
    private readonly ticketOrder: TicketOrderServices
  ) {}

  async createTicketPayment(payload: CreateTicketPaymentPayload) {
    const { ticketOrder } = payload;

    const { tickets, event } = await TicketOrder.checkValidity(ticketOrder);

    // Verify if event is free, if so immediately complete payment
    if (event.isFree) {
      await this.ticketOrder.updateTicketOrder({
        ticketOrder: ticketOrder,
        status: PAYMENT_STATUS.SUCCEEDED,
      });
      return;
    }

    //
  }
}
