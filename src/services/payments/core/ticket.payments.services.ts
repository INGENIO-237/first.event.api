import { Service } from "typedi";
import config from "../../../config";
import Event, { IEvent } from "../../../models/events/event.model";
import { IUser } from "../../../models/user.model";
import TicketPaymentRepo from "../../../repositories/payments/ticket.payments.repository";
import { CreateTicketPaymentPayload } from "../../../schemas/payments/ticket.payment.schemas";
import {
  ComputeTotalTicketData,
  DiscountedCoupon,
  ENV,
} from "../../../utils/constants/common";
import { PAYMENT_STATUS } from "../../../utils/constants/plans-and-subs";
import CouponServices from "../../coupons/coupon.services";
import UserServices from "../../user.services";
import StripeServices from "../stripe.services";

@Service()
export default class TicketPaymentServices {
  constructor(
    private readonly repository: TicketPaymentRepo,
    private readonly userService: UserServices,
    private readonly stripe: StripeServices,
    private readonly couponService: CouponServices
  ) {}

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

    let finalAmount = 0;
    let finalCoupons: DiscountedCoupon[] = [];

    if (!event.isFree) {
      const { total, cpns } = await this.computeTotal({
        tickets: matchingTickets,
        coupons: coupons as string[],
      });

      finalAmount = total;
      finalCoupons = cpns;
    }

    const { paymentIntent, clientSecret, ephemeralKey, fees } =
      await this.stripe.initiatePayment({
        amount: finalAmount,
        customerId: stripeCustomer as string,
        paymentMethodId,
      });

    const { _id: paymentId } = await this.repository.createTicketPayment({
      ...payload,
      paymentIntent,
      amount: finalAmount,
      fees,
      coupons: finalCoupons,
      tickets: matchingTickets,
    });

    if (process.env.NODE_ENV !== ENV.PROD || paymentMethodId || event.isFree) {
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
  }: {
    paymentIntent?: string;
    paymentId?: string;
  }) {
    return await this.repository.getTicketPayment({ paymentIntent, paymentId });
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
