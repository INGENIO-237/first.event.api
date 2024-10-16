import { Service } from "typedi";
import {
  GetCoupons,
  RegisterCoupon,
  UpdateCoupon,
} from "../../schemas/events/coupon.schemas";
import InfluencerCoupon from "../../models/events/influencer.coupon.model";
import { Types } from "mongoose";

@Service()
export default class InfluencerCouponRepo {
  async getCoupons({ event }: GetCoupons["query"]) {
    return InfluencerCoupon.find({ event });
  }

  async getCoupon({ code, id }: { code?: string; id?: string }) {
    return Types.ObjectId.isValid(id as string)
      ? await InfluencerCoupon.findById(id)
      : await InfluencerCoupon.findOne({ code: "TC-" + code });
  }

  async registerCoupon(coupon: RegisterCoupon["body"] & { code: string }) {
    return InfluencerCoupon.create(coupon);
  }

  async updateCoupon({
    coupon,
    couponPayload,
  }: {
    couponPayload: UpdateCoupon["body"];
    coupon: string;
  }) {
    await InfluencerCoupon.findByIdAndUpdate(coupon, couponPayload);
  }
}
