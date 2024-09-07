import { Request, Response } from "express";
import { Service } from "typedi";
import HTTP from "../../utils/constants/http.responses";
import SubscriptionServices from "../../services/subs/subscription.services";

@Service()
export default class SubscriptionController {
  constructor(private service: SubscriptionServices) {}

  // TODO: Get subscriptions list
  async getSubscriptions(req: Request, res: Response) {}
  // TODO: Get single subscritption
  async getSubscription(req: Request, res: Response) {}
  // TODO: Update subscription
  async updateSubscription(req: Request, res: Response) {}
  // Request subscription cancellation
  async cancelSubscription(req: Request, res: Response) {
    const { id } = (req as any).user;

    await this.service.requestSubscriptionCancellation({ user: id });

    return res.status(HTTP.CREATED).json({
      message:
        "Votre requête a bien été prise en compte. Nous allons la traiter, et vous revenir. Merci de bien vouloir patienter.",
    });
  }
}
