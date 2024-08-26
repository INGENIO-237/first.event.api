import "reflect-metadata";

import EventEmitter from "node:events";
import { BILLING_TYPE, SUBS_ACTIONS } from "../utils/constants/plans-and-subs";
import Container from "typedi";
import { PlanServices, SubscriptionServices } from "../services/subs";
import SubscriptionPaymentServices from "../services/payments/subscription.payments.services";
import { ISubscriptionPayment } from "../models/payments/subscription.payment.model";
import moment from "moment";
import { IPlan } from "../models/subs/plan.model";
import OrganizerServices from "../services/professionals/organizer.services";

const SubsHooks = new EventEmitter();

const subsService = Container.get(SubscriptionServices);
const subsPaymentsService = Container.get(SubscriptionPaymentServices);
const planService = Container.get(PlanServices);
const organizerService = Container.get(OrganizerServices);

SubsHooks.on(
  SUBS_ACTIONS.SUB_PAYMENT_SUCCEEDED,
  async (paymentIntent: string) => {
    const {
      _id: payment,
      billed,
      plan,
      user,
    } = (await subsPaymentsService.getSubscriptionPayment({
      paymentIntent,
    })) as ISubscriptionPayment;
    const { tryDays } = (await planService.getPlan(plan as string)) as IPlan;

    const freemiumEnd = moment(new Date()).add(tryDays, "days").toDate();
    const startsOn = moment(freemiumEnd).add(1, "days").toDate();
    const endsOn = moment(startsOn)
      .add(billed == BILLING_TYPE.YEARLY ? 12 : 1, "months")
      .toDate();

    const { _id: subscription } = await subsService.createSubscription({
      payment: payment as string,
      freemiumEndsOn: freemiumEnd,
      startsOn,
      endsOn,
    });

    await organizerService.updateOrganizer(user as string, {
      subscription: subscription as string,
    });
  }
);

export default SubsHooks;
