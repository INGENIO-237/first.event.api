import { Request, Response } from "express";
import { Service } from "typedi";
import { RegisterSubscription } from "../../schemas/subs/subscription.schemas";
import SubscriptionPaymentServices from "../../services/payments/core-payments/subscription.payments.services";
import HTTP from "../../utils/constants/http.responses";

@Service()
export default class SubscriptionPaymentController {
  constructor(private service: SubscriptionPaymentServices) {}

  // async registerSubscription(
  //   req: Request<{}, {}, RegisterSubscription["body"]>,
  //   res: Response
  // ) {
  //   const { id } = (req as any).user;
  //   const payment = await this.service.createSubscriptionPayment({
  //     ...req.body,
  //     user: id,
  //   });

  //   return res.status(HTTP.CREATED).json(payment);
  // }
}
