import moment from "moment";
import { ObjectId } from "mongoose";
import EventEmitter from "node:events";
import { Service } from "typedi";
import config from "../../../config";
import EventBus from "../../../hooks/event-bus";
import Event, { IEvent } from "../../../models/events/event.model";
import { ITicketPayment } from "../../../models/payments/ticket.payment.model";
import { IOrganizer } from "../../../models/professionals/organizer.model";
import { IUser } from "../../../models/user.model";
import TicketPaymentRepo from "../../../repositories/payments/ticket.payments.repository";
import { CreateTicketPaymentPayload } from "../../../schemas/payments/ticket.payment.schemas";
import {
  ComputeTotalTicketData,
  DiscountedCoupon,
  ENV,
} from "../../../utils/constants/common";
import HTTP from "../../../utils/constants/http.responses";
import {
  PAYMENT_ACTIONS,
  PAYMENT_STATUS,
} from "../../../utils/constants/plans-and-subs";
import ApiError from "../../../utils/errors/errors.base";
import CouponServices from "../../coupons/coupon.services";
import UserServices from "../../user.services";
import StripeServices from "../stripe.services";

@Service()
export default class TicketPaymentServices {
  private emitter: EventEmitter;

  constructor(
    private readonly repository: TicketPaymentRepo,
    private readonly userService: UserServices,
    private readonly stripe: StripeServices,
    private readonly couponService: CouponServices
  ) {
    this.emitter = EventBus.getEmitter();
  }

  async createTicketPayment(payload: CreateTicketPaymentPayload) {
    const {
      tickets: userTickets,
      event: eventId,
      coupons,
      paymentMethodId,
      user,
    } = payload;

    const event = (await Event.checkValidity(eventId)) as IEvent;

    const { stripeCustomer } = (await this.userService.getUser({
      userId: user,
      raiseException: false,
    })) as IUser;

    const { tickets } = event;

    const matchingTickets = this.getTicketPrice(tickets, userTickets);

    if (!event.isFree) {
      const { total, cpns } = await this.computeTotal({
        tickets: matchingTickets,
        coupons: coupons as string[],
      });

      const { paymentIntent, clientSecret, ephemeralKey, fees } =
        await this.stripe.initiatePayment({
          amount: total,
          customerId: stripeCustomer as string,
          paymentMethodId,
        });

      const { _id: paymentId } = await this.repository.createTicketPayment({
        ...payload,
        paymentIntent,
        amount: total,
        fees,
        coupons: cpns,
        tickets: matchingTickets,
      });

      if (process.env.NODE_ENV !== ENV.PROD || paymentMethodId) {
        setTimeout(() => {
          this.stripe.confirmPaymentIntent(paymentIntent);
        }, config.PAYMENT_CONFIRMATION_TIMEOUT);
      }

      return {
        paymentIntent,
        clientSecret,
        ephemeralKey,
        paymentId,
      };
    } else {
      const { _id: paymentId } = await this.repository.createTicketPayment({
        ...payload,
        tickets: matchingTickets,
        amount: 0,
        fees: 0,
        coupons: [],
        paymentIntent: "free",
        status: PAYMENT_STATUS.SUCCEEDED,
      });

      return { paymentId };
    }
  }

  async requestTicketPaymentRefund({
    payment,
    user,
  }: {
    payment: string;
    user: string;
  }) {
    const {
      event,
      user: payer,
      amount,
      paymentIntent,
      refund
    } = (await this.getTicketPayment({
      paymentId: payment,
      raiseException: true,
    })) as ITicketPayment;

    if(refund){
      throw new ApiError(HTTP.BAD_REQUEST, "Ce paiement a déjà été remboursé.");
    }

    let isOrganizer = false;

    const { startDate, organizer: eventOrg } = await Event.checkValidity(
      event.toString()
    );

    const { user: orgUser } = eventOrg as IOrganizer;

    if (orgUser) isOrganizer = orgUser.toString() == user;

    if ((payer as ObjectId).toString() !== user && !isOrganizer) {
      throw new ApiError(
        HTTP.FORBIDDEN,
        "Vous n'êtes pas autorisé à effectuer cette action"
      );
    }

    if (paymentIntent == "free" || amount == 0) {
      throw new ApiError(
        HTTP.BAD_REQUEST,
        `Vous ne pouvez pas demander un remboursement pour cet événement.Veuillez contacter l'${
          isOrganizer ? "administrateur" : "organisateur"
        } pour plus d'informations.`
      );
    }

    // TODO: Get refund deadline from organizer's profile
    const TICKET_REFUND_DEADLINE = config.TICKET_REFUND_DEADLINE; // Days
    const present = new Date();

    const dateDiff = moment(present).diff(moment(startDate), "days");

    if (dateDiff < TICKET_REFUND_DEADLINE && !isOrganizer) {
      throw new ApiError(
        HTTP.BAD_REQUEST,
        "Vous ne pouvez plus demander un remboursement pour cet événement. Le délai est passé. Veuillez contacter l'organisateur pour plus d'informations."
      );
    }

    this.emitter.emit(PAYMENT_ACTIONS.REFUND_TICKET, { payment, amount });
  }

  async refundTicketPayment({
    paymentId,
    amount,
  }: {
    paymentId: string;
    amount: number;
  }) {
    const { paymentIntent } = (await this.getTicketPayment({
      paymentId,
    })) as ITicketPayment;

    return await this.stripe.createRefund({ paymentIntent, amount });
  }

  private getTicketPrice(
    tickets: { cat: string; price: number }[],
    userTickets: { cat: string; quantity: number }[]
  ) {
    const matchingTickets: {
      cat: string;
      price: number;
      quantity: number;
    }[] = [];

    userTickets.forEach((ticket) => {
      const foundTicket = tickets.find(
        (t) => t.cat.toLowerCase() === ticket.cat.toLowerCase()
      );

      if (foundTicket) {
        matchingTickets.push({
          cat: foundTicket.cat,
          price: foundTicket.price,
          quantity: ticket.quantity,
        });
      }
    });

    return matchingTickets;
  }

  private async computeTotal(data: ComputeTotalTicketData) {
    let total = 0;

    const { tickets, coupons } = data;

    let cpns: DiscountedCoupon[] = [];

    tickets.forEach((ticket) => {
      const { quantity, price } = ticket;

      total += price * quantity;
    });

    if (coupons) {
      const { total: discountedTotal, coupons: discountedCoupons } =
        await this.couponService.applyCoupons({
          coupons,
          amount: total,
        });

      cpns = discountedCoupons;
      total = discountedTotal;
    }

    return { total, cpns };
  }

  async getTicketPayment({
    paymentIntent,
    paymentId,
    raiseException = false,
  }: {
    paymentIntent?: string;
    paymentId?: string;
    raiseException?: boolean;
  }) {
    const payment = (await this.repository.getTicketPayment({
      paymentIntent,
      paymentId,
    })) as ITicketPayment;

    if (!payment && raiseException) {
      throw new ApiError(HTTP.NOT_FOUND, "Ce paiement n'existe pas");
    }

    return payment;
  }

  async updateTicketPayment({
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
    await this.repository.updateTicketPayment({
      paymentId,
      paymentIntent,
      status,
      receipt,
      failMessage,
    });
  }
}
