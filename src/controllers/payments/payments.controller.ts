import { Request, Response } from "express";
import { RegisterSubscription } from "../../schemas/subs/subscription.schemas";
import HTTP from "../../utils/constants/http.responses";
import { Service } from "typedi";
import PaymentsServices from "../../services/payments/payments.services";

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

  async handleWebhook(req: Request, res: Response) {
    const signature = req.headers["stripe-signature"] as string | string[];

    await this.service.handleWebhook(signature, req.body);

    return res.sendStatus(HTTP.OK);
  }
}
