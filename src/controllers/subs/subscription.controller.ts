import { Request, Response } from "express";
import { Service } from "typedi";

@Service()
export default class SubscriptionController {
  // TODO: Get subscriptions list
  async getSubscriptions(req: Request, res: Response) {}
  // TODO: Get single subscritption
  async getSubscription(req: Request, res: Response) {}
  // TODO: Update subscription
  async updateSubscription(req: Request, res: Response) {}
  // Request subscription cancellation
  async cancelSubscription(req: Request, res: Response) {}
}
