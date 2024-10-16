import { Service } from "typedi";
import {
  GetCoupons,
  RegisterCoupon,
  UpdateCoupon,
} from "../../schemas/products/product.coupon.schemas";
import InfluencerCoupon from "../../models/products/product.influencer.coupon.model";
import { Types } from "mongoose";

@Service()
export default class InfluencerCouponRepo {
  async getCoupons({ product }: GetCoupons["query"]) {
    return InfluencerCoupon.find({ product });
  }

  async getCoupon({ code, id }: { code?: string; id?: string }) {
    return Types.ObjectId.isValid(id as string)
      ? await InfluencerCoupon.findById(id)
      : await InfluencerCoupon.findOne({ code: "PC-" + code });
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
