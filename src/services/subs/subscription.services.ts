import { Service } from "typedi";
import { SubsRepo } from "../../repositories/subs";
import { CreateSubscription } from "../../schemas/subs/subscription.schemas";
import { ISubscription } from "../../models/subs/subscription.model";
import ApiError from "../../utils/errors/errors.base";
import HTTP from "../../utils/constants/http.responses";

@Service()
export default class SubscriptionServices {
  constructor(private repository: SubsRepo) {}

  async createSubscription(payload: CreateSubscription) {
    return await this.repository.createSubscription(payload);
  }

  async getSubscription({
    subscriptionId,
    raiseException = false,
  }: {
    subscriptionId: string;
    raiseException?: boolean;
  }) {
    const subscription = (await this.repository.getSubscription(
      subscriptionId
    )) as ISubscription;

    if (!subscription && raiseException) {
      throw new ApiError(HTTP.NOT_FOUND, "La souscription n'existe pas");
    }

    return subscription;
  }
}
