import { Service } from "typedi";
import { SubsRepo } from "../../repositories/subs";
import { CreateSubscription } from "../../schemas/subs/subscription.schemas";

@Service()
export default class SubscriptionServices {
  constructor(private repository: SubsRepo) {}

  async createSubscription(payload: CreateSubscription) {
    return await this.repository.createSubscription(payload);
  }
}
