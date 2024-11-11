import { Request, Response } from "express";
import { Service } from "typedi";
import {
  GetSubscription,
  GetSubscriptions,
} from "../../schemas/subs/subscription.schemas";
import SubscriptionServices from "../../services/subs/subscription.services";
import HTTP from "../../utils/constants/http.responses";

@Service()
export default class SubscriptionController {
  constructor(private service: SubscriptionServices) {}

  async getSubscriptions(
    req: Request<{}, {}, {}, GetSubscriptions["query"]>,
    res: Response
  ) {
    const user = (req as any).user;

    const subscriptions = await this.service.getSubscriptions({
      user,
      ...req.query,
    });

    return res.status(HTTP.OK).json(subscriptions);
  }

  async getSubscription(
    req: Request<GetSubscription["params"]>,
    res: Response
  ) {
    const { subscription: subId } = req.params;

    const subscription = await this.service.getSubscription({
      subscriptionId: subId,
    });

    return res.status(HTTP.OK).json(subscription);
  }

  async cancelSubscription(req: Request, res: Response) {
    const { id } = (req as any).user;

    await this.service.requestSubscriptionCancellation({ user: id });

    return res.status(HTTP.CREATED).json({
      message:
        "Votre requête a bien été prise en compte. Nous allons la traiter, et vous revenir. Merci de bien vouloir patienter.",
    });
  }
}
