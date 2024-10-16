import { Service } from "typedi";
import Coupon from "../../models/events/coupon.model";
import {
  GetCoupons,
  RegisterCoupon,
} from "../../schemas/events/coupon.schemas";

@Service()
export default class CouponRepo {
  async getCoupons({ event }: GetCoupons["query"]) {
    return await Coupon.find({ event });
  }

  async registerCoupon(coupon: RegisterCoupon["body"] & { code: string }) {
    return await Coupon.create(coupon);
  }
}
