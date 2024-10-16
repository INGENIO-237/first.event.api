import { Service } from "typedi";
import Coupon from "../../models/events/coupon.model";
import {
  GetCoupons,
  RegisterCoupon,
  UpdateCoupon,
} from "../../schemas/events/coupon.schemas";
import { Types } from "mongoose";

@Service()
export default class CouponRepo {
  async getCoupons({ event }: GetCoupons["query"]) {
    return await Coupon.find({ event });
  }

  async getCoupon({ code, id }: { code?: string; id?: string }) {
    return Types.ObjectId.isValid(id as string)
      ? await Coupon.findById(id)
      : await Coupon.findOne({ code: "TC-" + code });
  }

  async registerCoupon(coupon: RegisterCoupon["body"]) {
    return await Coupon.create(coupon);
  }

  async updateCoupon({
    coupon,
    couponPayload,
  }: {
    couponPayload: UpdateCoupon["body"];
    coupon: string;
  }) {
    await Coupon.findByIdAndUpdate(coupon, couponPayload);
  }
}
