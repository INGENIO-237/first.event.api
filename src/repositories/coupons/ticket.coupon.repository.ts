import { Service } from "typedi";
import TicketCoupon from "../../models/coupons/ticket.coupon.model";
import { Types } from "mongoose";
import {
  GetTicketCoupons,
  RegisterTicketCoupon,
  UpdateTicketCoupon,
} from "../../schemas/coupons/ticket.coupon.schemas";

@Service()
export default class TicketCouponRepo {
  async getCoupons({ event }: GetTicketCoupons["query"]) {
    return await TicketCoupon.find({ event });
  }

  async getCoupon({ code, id }: { code?: string; id?: string }) {
    return Types.ObjectId.isValid(id as string)
      ? await TicketCoupon.findById(id)
      : await TicketCoupon.findOne({ code });
  }

  async registerCoupon(coupon: RegisterTicketCoupon["body"]) {
    return await TicketCoupon.create(coupon);
  }

  async updateCoupon({
    coupon,
    couponPayload,
  }: {
    couponPayload: UpdateTicketCoupon["body"];
    coupon: string;
  }) {
    await TicketCoupon.findByIdAndUpdate(coupon, couponPayload);
  }
}
