import { Service } from "typedi";
import Coupon from "../../models/products/product.coupon.model";
import {
  GetCoupons,
  RegisterCoupon,
  UpdateCoupon,
} from "../../schemas/products/product.coupon.schemas";
import { Types } from "mongoose";

@Service()
export default class CouponRepo {
  async getCoupons({ product }: GetCoupons["query"]) {
    return await Coupon.find({ product });
  }

  async getCoupon({ code, id }: { code?: string; id?: string }) {
    return Types.ObjectId.isValid(id as string)
      ? await Coupon.findById(id)
      : await Coupon.findOne({ code: "PC-" + code });
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
