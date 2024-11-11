import { Request, Response } from "express";
import { Service } from "typedi";
import { CreateProductPaymentInput } from "../../schemas/payments/product.payment.schemas";
import { CreateTicketPaymentInput } from "../../schemas/payments/ticket.payment.schemas";
import { RegisterSubscription } from "../../schemas/subs/subscription.schemas";
import PaymentsServices from "../../services/payments/payments.services";
import HTTP from "../../utils/constants/http.responses";
import { RequestPaymentRefundInput } from "../../schemas/payments/refund.schemas";

@Service()
export default class PaymentsController {
  constructor(private service: PaymentsServices) {}

  // Subscriptions
  async initiateSubscriptionPayment(
    req: Request<{}, {}, RegisterSubscription["body"]>,
    res: Response
  ) {
    const { id } = (req as any).user;
    const payment = await this.service.initiateSubscriptionPayment({
      data: req.body,
      user: id,
    });

    return res.status(HTTP.CREATED).json(payment);
  }

  // Tickets
  async initiateTicketPayment(
    req: Request<{}, {}, CreateTicketPaymentInput["body"]>,
    res: Response
  ) {
    const { id } = (req as any).user;

    const payment = await this.service.initiateTicketPayment({
      ...req.body,
      user: id,
    });

    return res.status(HTTP.CREATED).json(payment);
  }

  async requestTicketPaymentRefund(
    req: Request<RequestPaymentRefundInput["params"]>,
    res: Response
  ) {
    await this.service.requestTicketPaymentRefund({
      payment: req.params.payment,
      user: (req as any).user.id,
    });

    return res.status(HTTP.CREATED).json({
      message:
        "Votre requête a bien été prise en compte. Nous allons la traiter, et vous revenir. Merci de bien vouloir patienter.",
    });
  }

  // Products
  async initiateProductPayment(
    req: Request<{}, {}, CreateProductPaymentInput["body"]>,
    res: Response
  ) {
    const { id } = (req as any).user;

    const payment = await this.service.initiateProductPayment({
      ...req.body,
      user: id,
    });

    return res.status(HTTP.CREATED).json(payment);
  }

  async requestProductPaymentRefund(
    req: Request<RequestPaymentRefundInput["params"]>,
    res: Response
  ) {
    await this.service.requestProductPaymentRefund({
      payment: req.params.payment,
      user: (req as any).user,
    });

    return res.status(HTTP.CREATED).json({
      message:
        "Votre requête a bien été prise en compte. Nous allons la traiter, et vous revenir. Merci de bien vouloir patienter.",
    });
  }

  // Webhook
  async handleWebhook(req: Request, res: Response) {
    const signature = req.headers["stripe-signature"] as string | string[];

    await this.service.handleWebhook(signature, req.body);

    return res.sendStatus(HTTP.OK);
  }
}
