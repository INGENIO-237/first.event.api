import { Service } from "typedi";
import TicketPaymentRepo from "../../../repositories/payments/ticket.payments.repository";
import TicketOrder from "../../../models/orders/ticket.order.model";
import TicketOrderServices from "../../orders/ticket.order.services";
import { CreateTicketPaymentPayload } from "../../../schemas/payments/ticket.payment.schemas";
import { PAYMENT_STATUS } from "../../../utils/constants/plans-and-subs";
import StripeServices from "../stripe.services";
import UserServices from "../../user.services";
import { IUser } from "../../../models/user.model";
import CouponServices from "../../coupons/coupon.services";
import { ComputeTotalTicketData, ENV } from "../../../utils/constants/common";

@Service()
export default class TicketPaymentServices {
  constructor(
    private readonly repository: TicketPaymentRepo,
    private readonly ticketOrder: TicketOrderServices,
    private readonly userService: UserServices,
    private readonly stripe: StripeServices,
    private readonly couponService: CouponServices
  ) {}

  async createTicketPayment(payload: CreateTicketPaymentPayload) {
    const { ticketOrder, coupons, paymentMethodId, user } = payload;

    const { tickets, event } = await TicketOrder.checkValidity(ticketOrder);

    // Verify if event is free, if so immediately complete payment
    if (event.isFree) {
      await this.ticketOrder.updateTicketOrder({
        ticketOrder,
        status: PAYMENT_STATUS.SUCCEEDED,
      });
      return;
    } else {
      const { stripeCustomer } = (await this.userService.getUser({
        userId: user,
        raiseException: false,
      })) as IUser;

      const total = await this.computeTotal({
        tickets,
        coupons: coupons as string[],
      });

      console.log({ total });

      const { paymentIntent, clientSecret, ephemeralKey, fees } =
        await this.stripe.initiatePayment({
          amount: total,
          customerId: stripeCustomer as string,
          paymentMethodId,
        });

      await this.repository.createTicketPayment({
        ...payload,
        paymentIntent,
        amount: total,
        fees,
      });

      if (process.env.NODE_ENV !== ENV.PROD || paymentMethodId) {
        setTimeout(() => {
          this.stripe.confirmPaymentIntent(paymentIntent);
        }, 7000);
      }

      return {
        paymentIntent,
        clientSecret,
        ephemeralKey,
      };
    }
  }

  private async computeTotal(data: ComputeTotalTicketData) {
    let total = 0;

    const { tickets, coupons } = data;

    tickets.forEach((ticket) => {
      const { quantity, price } = ticket;

      total += price * quantity;
    });

    if (coupons)
      total = await this.couponService.applyCoupons({
        coupons,
        amount: total,
      });

    return total;
  }

  async getTicketPayment({ paymentIntent, paymentId }: { paymentIntent?: string, paymentId?: string }) {
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
