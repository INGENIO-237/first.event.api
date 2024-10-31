import { Service } from "typedi";
import SubscriptionServices from "../services/subs/subscription.services";
import SubscriptionPaymentServices from "../services/payments/core/subscription.payments.services";
import PlanServices from "../services/subs/plan.services";
import OrganizerServices from "../services/professionals/organizer.services";
import {
  ASSISTANCE,
  BILLING_TYPE,
  PAYMENT_ACTIONS,
  PAYMENT_STATUS,
  TICKETS_PER_EVENT,
} from "../utils/constants/plans-and-subs";
import { ISubscriptionPayment } from "../models/payments/subscription.payment.model";
import { IPlan } from "../models/subs/plan.model";
import moment from "moment";
import RefundServices from "../services/payments/refund.services";
import EventEmitter from "node:events";
import { IRefund } from "../models/payments/refund.model";
import { TicketPaymentServices } from "../services/payments/core";

@Service()
export default class PaymentsHooks {
  constructor(
    private subsService: SubscriptionServices,
    private refundService: RefundServices,
    private subsPaymentsService: SubscriptionPaymentServices,
    private ticketPaymentService: TicketPaymentServices,
    private planService: PlanServices,
    private organizerService: OrganizerServices
  ) {}

  registerListeners(emitter: EventEmitter) {
    // Subscription payment ==>
    emitter.on(
      PAYMENT_ACTIONS.SUBSCRIPTION_SUCCEEDED,
      async ({
        paymentIntent,
        receipt,
      }: {
        paymentIntent: string;
        receipt: string;
      }) => {
        // Update subscription payment status
        await this.subsPaymentsService.updateSubscriptionPayment({
          paymentIntent,
          status: PAYMENT_STATUS.SUCCEEDED,
          receipt,
        });

        // Create subscription accordingly
        const {
          _id: payment,
          billed,
          plan,
          user,
        } = (await this.subsPaymentsService.getSubscriptionPayment({
          paymentIntent,
        })) as ISubscriptionPayment;
        const {
          tryDays,
          ticketsPerEvent,
          assistance,
          couponsPerEvent,
          promotion,
        } = (await this.planService.getPlan(plan as string)) as IPlan;

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
            ticketsPerEvent: ticketsPerEvent as TICKETS_PER_EVENT,
            assistance: assistance as ASSISTANCE,
            couponsPerEvent,
            promotion,
          }
        );

        await this.organizerService.updateOrganizer(user as string, {
          subscription: subscription as string,
        });
      }
    );

    emitter.on(
      PAYMENT_ACTIONS.SUBSCRIPTION_FAILED,
      async ({
        paymentIntent,
        failMessage,
      }: {
        paymentIntent: string;
        failMessage: string;
      }) => {
        await this.subsPaymentsService.updateSubscriptionPayment({
          paymentIntent,
          failMessage,
          status: PAYMENT_STATUS.FAILED,
        });
      }
    );
    // <==

    // Ticket payment ==>
    emitter.on(
      PAYMENT_ACTIONS.TICKET_PAYMENT_SUCCEEDED,
      async ({
        paymentIntent,
        receipt,
      }: {
        paymentIntent: string;
        receipt: string;
      }) => {
        // Update ticket payment status
        await this.ticketPaymentService.updateTicketPayment({
          paymentIntent,
          status: PAYMENT_STATUS.SUCCEEDED,
          receipt,
        });
      }
    );

    emitter.on(
      PAYMENT_ACTIONS.TICKET_PAYMENT_FAILED,
      async ({
        paymentIntent,
        failMessage,
      }: {
        paymentIntent: string;
        failMessage: string;
      }) => {
        await this.ticketPaymentService.updateTicketPayment({
          paymentIntent,
          failMessage,
          status: PAYMENT_STATUS.FAILED,
        });
      }
    );
    // <==

    // Sub Refunds ==>
    emitter.on(
      PAYMENT_ACTIONS.REFUND_SUBSCRIPTION,
      async ({
        endsOn,
        freemiumEndsOn,
        payment,
      }: {
        endsOn: Date;
        freemiumEndsOn: Date;
        payment: any;
      }) => {
        await this.refundService.processSubRefundRequest({
          endsOn,
          freemiumEndsOn,
          payment,
        });
      }
    );

    emitter.on(
      PAYMENT_ACTIONS.REFUND_SUB_SUCCEEDED,
      async ({ paymentIntent }: { paymentIntent: string }) => {
        await this.refundService.updateRefund({
          paymentIntent,
          status: PAYMENT_STATUS.SUCCEEDED,
        });

        const { payment } = (await this.refundService.getRefund({
          paymentIntent,
        })) as IRefund;

        const { _id: subscriptionId } = await this.subsService.getSubscription({
          payment: payment as string,
        });

        // Update sub to set cancellation info
        if (subscriptionId) {
          await this.subsService.updateSubscription({
            subscriptionId: subscriptionId as string,
            hasBeenCancelled: true,
            cancelDate: new Date(),
          });
        }
      }
    );

    emitter.on(
      PAYMENT_ACTIONS.REFUND_SUB_FAILED,
      async ({
        paymentIntent,
        failMessage,
      }: {
        paymentIntent: string;
        failMessage?: string;
      }) => {
        await this.refundService.updateRefund({
          paymentIntent,
          failMessage,
          status: PAYMENT_STATUS.FAILED,
        });
      }
    );
    // <==
  }
}
