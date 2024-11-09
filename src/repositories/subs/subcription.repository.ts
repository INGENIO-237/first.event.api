import { Service } from "typedi";
import {
  CreateSubscription,
  GetSubscriptions,
} from "../../schemas/subs/subscription.schemas";
import Subscription from "../../models/subs/subscription.model";
import { Types } from "mongoose";

@Service()
export default class SubsRepo {
  async getSubscriptions(filters: Omit<GetSubscriptions["query"], "target">) {
    const { page, limit } = filters;

    return page && limit
      ? await Subscription.find()
          .skip((page - 1) * limit)
          .limit(limit)
          .populate("payment")
      : await Subscription.find().populate("payment");
  }

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
