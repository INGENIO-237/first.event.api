import { Service } from "typedi";
import ProductCoupon from "../../models/coupons/product.coupon.model";
import {
  GetProductCoupons,
  RegisterProductCoupon,
  UpdateProductCoupon,
} from "../../schemas/coupons/product.coupon.schemas";
import { Types } from "mongoose";

@Service()
export default class ProductCouponRepo {
  async getCoupons({ product }: GetProductCoupons["query"]) {
    return await ProductCoupon.find({ product });
  }

  async getCoupon({ code, id }: { code?: string; id?: string }) {
    return Types.ObjectId.isValid(id as string)
      ? await ProductCoupon.findById(id)
      : await ProductCoupon.findOne({ code });
  }

  async registerCoupon(coupon: RegisterProductCoupon["body"]) {
    return await ProductCoupon.create(coupon);
  }

  async updateCoupon({
    coupon,
    couponPayload,
  }: {
    couponPayload: UpdateProductCoupon["body"];
    coupon: string;
  }) {
    await ProductCoupon.findByIdAndUpdate(coupon, couponPayload);
  }
}
