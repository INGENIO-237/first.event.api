import { Service } from "typedi";
import { CreateSubscription } from "../../schemas/subs/subscription.schemas";
import { ISubscription } from "../../models/subs/subscription.model";
import ApiError from "../../utils/errors/errors.base";
import HTTP from "../../utils/constants/http.responses";
import OrganizerServices from "../professionals/organizer.services";
import { ISubscriptionPayment } from "../../models/payments/subscription.payment.model";
import {
  BILLING_TYPE,
  PAYMENT_ACTIONS,
} from "../../utils/constants/plans-and-subs";
import moment from "moment";
import PaymentsServices from "../payments/payments.services";
import SubsRepo from "../../repositories/subs/subcription.repository";
import PaymentsHooks from "../../hooks/payments.hooks";

@Service()
export default class SubscriptionServices {
  constructor(
    private repository: SubsRepo,
    private organizerService: OrganizerServices,
    private paymentService: PaymentsServices,
    private paymentHooks: PaymentsHooks
  ) {}

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

      subscription = organizer.subscription as ISubscription;
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

    this.paymentHooks.emit(PAYMENT_ACTIONS.REFUND_SUBSCRIPTION, sub);

    // TODO: Send Email to organizer
  }

  async processRefundRequest({ subscriptionId }: { subscriptionId: string }) {
    const { payment, freemiumEndsOn, endsOn } = await this.getSubscription({
      subscriptionId,
    });

    const {
      billed,
      amount,
      unitPrice,
      _id: paymentId,
    } = payment as ISubscriptionPayment;

    let amountToRefund = amount;

    const present = new Date();
    const presentTime = present.getTime();
    const freePeriod = freemiumEndsOn.getTime();

    if (freePeriod < presentTime) {
      if (billed === BILLING_TYPE.MONTHLY) {
        const remainingDays = moment(present).diff(endsOn, "days");
        amountToRefund = (unitPrice as number) * remainingDays;
      } else {
        const remainingMonths = moment(present).diff(endsOn, "months");
        amountToRefund = (unitPrice as number) * remainingMonths;
      }
    }

    // Initiate refunding
    await this.paymentService.initiateRefund({
      paymentId: paymentId as string,
      amount: amountToRefund,
    });

    // TODO: Update sub to set cancellation info
  }
}
