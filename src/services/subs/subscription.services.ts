import { ObjectId } from "mongoose";
import EventEmitter from "node:events";
import { Service } from "typedi";
import EventBus from "../../hooks/event-bus";
import { ISubscription } from "../../models/subs/subscription.model";
import SubsRepo from "../../repositories/subs/subcription.repository";
import {
  CreateSubscription,
  GetSubscriptions,
} from "../../schemas/subs/subscription.schemas";
import HTTP from "../../utils/constants/http.responses";
import {
  PAYMENT_ACTIONS,
  PAYMENT_STATUS,
} from "../../utils/constants/payments-and-subs";
import ApiError from "../../utils/errors/errors.base";
import { SubscriptionPaymentServices } from "../payments/core";
import OrganizerServices from "../professionals/organizer.services";

@Service()
export default class SubscriptionServices {
  private emitter: EventEmitter;

  constructor(
    private repository: SubsRepo,
    private organizerService: OrganizerServices,
    private paymentService: SubscriptionPaymentServices
  ) {
    this.emitter = EventBus.getEmitter();
  }

  async createSubscription(payload: CreateSubscription) {
    return await this.repository.createSubscription(payload);
  }

  async getSubscriptions({
    user, // incoming request initiator
    target, // organizer user id
    ...filters
  }: GetSubscriptions["query"] & {
    user: {
      id: string;
      isAdmin: boolean;
    };
  }) {
    if (target) {
      if (!user.isAdmin && user.id != target) {
        throw new ApiError(
          HTTP.FORBIDDEN,
          "Vous n'êtes pas autorisé à effectuer cette action"
        );
      }

      await this.organizerService.getOrganizer(target, true);

      // Retrieve organizer's successful subs payments
      let payments = await Promise.all([
        this.paymentService.getSubscriptionPayments({ user: target }),
      ]).then((data) => {
        let innerPayments = data.flat();

        innerPayments = innerPayments.filter(
          (payment) => payment.status == PAYMENT_STATUS.SUCCEEDED
        );

        return innerPayments.map((payment) =>
          (payment._id as ObjectId).toString()
        );
      });

      // From the payments, match related subscriptions
      let subscriptions: ISubscription[] = [];

      if (payments.length > 0) {
        subscriptions = await Promise.all([
          ...payments.map(async (payment) => {
            return (await this.repository.getSubscription({
              payment,
            })) as ISubscription;
          }),
        ]);

        const { page, limit } = filters;

        if (page && limit) {
          subscriptions = subscriptions.slice((page - 1) * limit, page * limit);
        }
      }

      return subscriptions;
    }

    if (!user.isAdmin) {
      throw new ApiError(
        HTTP.FORBIDDEN,
        "Vous n'êtes pas autorisé à effectuer cette action"
      );
    }

    return await this.repository.getSubscriptions(filters);
  }

  async getSubscription({
    subscriptionId,
    payment,
    raiseException = false,
  }: {
    subscriptionId?: string;
    payment?: string;
    raiseException?: boolean;
  }) {
    const subscription = (await this.repository.getSubscription({
      subscriptionId: subscriptionId as string,
      payment: payment as string,
    })) as any;

    if (!subscription && raiseException) {
      throw new ApiError(HTTP.NOT_FOUND, "La souscription n'existe pas");
    }

    return subscription;
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
    await this.repository.updateSubscription({
      subscriptionId,
      hasBeenCancelled,
      cancelDate,
    });
  }

  async requestSubscriptionCancellation({
    user,
    subscriptionId,
  }: {
    user?: string;
    subscriptionId?: string;
  }) {
    let subscription: ISubscription | undefined | null;

    // Get current user's active subscription
    if (user && !subscriptionId) {
      const organizer = await this.organizerService.getOrganizer(user);

      if (!organizer) {
        throw new ApiError(HTTP.BAD_REQUEST, "Vous n'êtes pas un organisateur");
      }

      subscription = await this.getSubscription({
        subscriptionId: organizer.subscription as string,
      });
    }

    // Get a given subscription
    if (subscriptionId) {
      subscription = await this.getSubscription({
        subscriptionId: subscriptionId as string,
        raiseException: true,
      });
    }

    // In case current user has not subscribed to any plan
    if (user && !subscriptionId && !subscription) {
      throw new ApiError(HTTP.NOT_FOUND, "La souscription n'existe pas");
    }

    // Make sure we don't cancel twice. So that we don't refund twice.
    const { hasBeenCancelled, cancelDate, endsOn, freemiumEndsOn, payment } =
      subscription as ISubscription;

    if (hasBeenCancelled && cancelDate) {
      throw new ApiError(
        HTTP.BAD_REQUEST,
        "La souscription a déjà été annulée"
      );
    }

    // Make sure the subscription has not expired yet
    const presentTime = new Date().getTime();

    if (presentTime >= endsOn.getTime()) {
      throw new ApiError(HTTP.BAD_REQUEST, "La souscription a déjà expiré");
    }

    this.emitter.emit(PAYMENT_ACTIONS.REFUND_SUBSCRIPTION, {
      endsOn,
      freemiumEndsOn,
      payment,
    });

    // TODO: Send Email to organizer
  }
}
