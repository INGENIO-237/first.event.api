import { Service } from "typedi";
import { CreateSubscription } from "../../schemas/subs/subscription.schemas";
import { ISubscription } from "../../models/subs/subscription.model";
import ApiError from "../../utils/errors/errors.base";
import HTTP from "../../utils/constants/http.responses";
import OrganizerServices from "../professionals/organizer.services";
import { PAYMENT_ACTIONS } from "../../utils/constants/plans-and-subs";
import SubsRepo from "../../repositories/subs/subcription.repository";
import EventEmitter from "node:events";
import EventBus from "../../hooks/event-bus";

@Service()
export default class SubscriptionServices {
  private emitter: EventEmitter;

  constructor(
    private repository: SubsRepo,
    private organizerService: OrganizerServices
  ) {
    this.emitter = EventBus.getEmitter();
  }

  async createSubscription(payload: CreateSubscription) {
    return await this.repository.createSubscription(payload);
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
    const {
      hasBeenCancelled,
      cancelDate,
      endsOn,
      _id: sub,
      freemiumEndsOn,
      payment,
    } = subscription as ISubscription;

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
