import { Service } from "typedi";
import { CreateSubscription } from "../../schemas/subs/subscription.schemas";
import Subscription from "../../models/subs/subscription.model";

@Service()
export default class SubsRepo {
  async createSubscription(payload: CreateSubscription) {
    return await Subscription.create(payload);
  }
  
  async getSubscription(subscriptionId: string) {
    return await Subscription.findById(subscriptionId);
  }
}
