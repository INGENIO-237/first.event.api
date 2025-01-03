import { Service } from "typedi";
import SubscriptionPaymentRepo from "../../../repositories/payments/subscription.payments.repository";
import { RegisterSubscription } from "../../../schemas/subs/subscription.schemas";
import StripeServices from "../stripe.services";
import { IPlan } from "../../../models/subs/plan.model";
import {
  BILLING_TYPE,
  PAYMENT_STATUS,
} from "../../../utils/constants/payments-and-subs";
import { ENV } from "../../../utils/constants/common";
import OrganizerServices from "../../professionals/organizer.services";
import UserServices from "../../user.services";
import { IUser } from "../../../models/user.model";
import { ISubscriptionPayment } from "../../../models/payments/subscription.payment.model";
import PlanServices from "../../subs/plan.services";
import config from "../../../config";

@Service()
export default class SubscriptionPaymentServices {
  constructor(
    private repository: SubscriptionPaymentRepo,
    private planService: PlanServices,
    private stripe: StripeServices,
    private organizerService: OrganizerServices,
    private userService: UserServices
  ) {}

  async getSubscriptionPayments({ user }: { user: string }) {
    return await this.repository.getSubscriptionPayments({
      user,
    });
  }

  async createSubscriptionPayment(
    payload: RegisterSubscription["body"] & { user: string }
  ) {
    const { plan, coupons, billed, user, paymentMethodId } = payload;

    let amount: number;
    // Get plan and price
    const { monthlyPrice, yearlyPrice } = (await this.planService.getPlan(
      plan,
      true
    )) as IPlan;

    amount = billed == BILLING_TYPE.MONTHLY ? monthlyPrice : yearlyPrice * 12;
    // TODO: Apply taxes

    // Ensure current user is legit to create a subscription payment
    await this.organizerService.validateAbilityToSubscribe(user);

    // Retrieve stripeCustomer ID
    const { stripeCustomer } = (await this.userService.getUser({
      userId: user,
      raiseException: false,
    })) as IUser;

    // Create payment intent
    const { paymentIntent, ephemeralKey, clientSecret, fees } =
      await this.stripe.initiatePayment({
        amount,
        customerId: stripeCustomer as string,
        paymentMethodId,
      });

    // Persist to DB
    const { _id: paymentId } = await this.repository.createSubscriptionPayment({
      ...payload,
      paymentIntent,
      amount,
      fees,
    });

    if (process.env.NODE_ENV !== ENV.PROD || paymentMethodId) {
      setTimeout(() => {
        this.stripe.confirmPaymentIntent(paymentIntent);
      }, config.PAYMENT_CONFIRMATION_TIMEOUT);
    }

    return { paymentIntent, ephemeralKey, clientSecret, paymentId };
  }

  async getSubscriptionPayment({
    paymentId,
    paymentIntent,
    user,
  }: {
    paymentId?: string;
    paymentIntent?: string;
    user?: string;
  }) {
    return await this.repository.getSubscriptionPayment({
      paymentId,
      paymentIntent,
      user,
    });
  }

  async updateSubscriptionPayment({
    paymentId,
    paymentIntent,
    status,
    receipt,
    failMessage,
  }: {
    paymentId?: string;
    paymentIntent?: string;
    status?: PAYMENT_STATUS;
    receipt?: string;
    failMessage?: string;
  }) {
    await this.repository.updateSubscriptionPayment({
      paymentId,
      paymentIntent,
      status,
      receipt,
      failMessage,
    });
  }

  async refundSubscriptionPayment({
    paymentId,
    amount,
  }: {
    paymentId: string;
    amount: number;
  }) {
    const { paymentIntent } = (await this.getSubscriptionPayment({
      paymentId,
    })) as ISubscriptionPayment;

    return await this.stripe.createRefund({ paymentIntent, amount });
  }
}
