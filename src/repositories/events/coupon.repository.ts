import { Service } from "typedi";
import Coupon from "../../models/events/coupon.model";
import { RegisterCoupon } from "../../schemas/events/coupon.schemas";

@Service()
export default class CouponRepo {
  async registerCoupon(coupon: RegisterCoupon["body"] & {code: string}) {
    return await Coupon.create(coupon);
  }
}
