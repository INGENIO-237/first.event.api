import { Service } from "typedi";
import { CreateSubscription } from "../../schemas/subs/subscription.schemas";
import Subscription from "../../models/subs/subscription.model";
import { Types } from "mongoose";

@Service()
export default class SubsRepo {
  async createSubscription(payload: CreateSubscription) {
    return await Subscription.create(payload);
  }

  async getSubscription({
    subscriptionId,
    payment,
  }: {
    subscriptionId?: string;
    payment?: string;
  }) {
    return await Subscription.findOne({
      $or: [
        { _id: new Types.ObjectId(subscriptionId) },
        { payment: new Types.ObjectId(payment) },
      ],
    }).populate("payment");
  }

  async updateSubscription({
    subscriptionId,
    hasBeenCancelled,
    cancelDate,
  }: {
    subscriptionId: string;
    hasBeenCancelled: boolean;
    cancelDate: Date;
  }) {
    await Subscription.findByIdAndUpdate(subscriptionId, {
      hasBeenCancelled,
      cancelDate,
    });
  }
}
