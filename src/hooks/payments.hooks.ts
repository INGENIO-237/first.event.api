import { EventEmitter } from "node:events";
import { Service } from "typedi";
import SubscriptionServices from "../services/subs/subscription.services";
import SubscriptionPaymentServices from "../services/payments/subscription.payments.services";
import PlanServices from "../services/subs/plan.services";
import OrganizerServices from "../services/professionals/organizer.services";
import {
  BILLING_TYPE,
  PAYMENT_ACTIONS,
} from "../utils/constants/plans-and-subs";
import { ISubscriptionPayment } from "../models/payments/subscription.payment.model";
import { IPlan } from "../models/subs/plan.model";
import moment from "moment";
import IHook from "./hook.interface";

@Service()
export default class PaymentsHooks implements IHook {
  private _eventEmitter: EventEmitter;

  constructor(
    private subsService: SubscriptionServices,
    private subsPaymentsService: SubscriptionPaymentServices,
    private planService: PlanServices,
    private organizerService: OrganizerServices
  ) {
    this._eventEmitter = new EventEmitter();
    this.register(this._eventEmitter);
  }

  getEmitter() {
    return this._eventEmitter;
  }

  emit(event: PAYMENT_ACTIONS, data: any) {
    this._eventEmitter.emit(event, data);
  }

  register(emitter: EventEmitter) {
    emitter.on(
      PAYMENT_ACTIONS.SUBSCRIPTION_SUCCEEDED,
      async (paymentIntent: string) => {
        const {
          _id: payment,
          billed,
          plan,
          user,
        } = (await this.subsPaymentsService.getSubscriptionPayment({
          paymentIntent,
        })) as ISubscriptionPayment;
        const { tryDays } = (await this.planService.getPlan(
          plan as string
        )) as IPlan;

        const freemiumEnd = moment(new Date()).add(tryDays, "days").toDate();
        const startsOn = moment(freemiumEnd).add(1, "days").toDate();
        const endsOn = moment(startsOn)
          .add(billed == BILLING_TYPE.YEARLY ? 12 : 1, "months")
          .toDate();

        const { _id: subscription } = await this.subsService.createSubscription(
          {
            payment: payment as string,
            freemiumEndsOn: freemiumEnd,
            startsOn,
            endsOn,
          }
        );

        await this.organizerService.updateOrganizer(user as string, {
          subscription: subscription as string,
        });
      }
    );

    emitter.on(
      PAYMENT_ACTIONS.REFUND_SUBSCRIPTION,
      async (subscriptionId: string) => {
        await this.subsService.processRefundRequest({ subscriptionId });
      }
    );
  }
}
