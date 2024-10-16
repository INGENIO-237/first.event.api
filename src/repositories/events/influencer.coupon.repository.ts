import { Service } from "typedi";
import {
  GetCoupons,
  RegisterCoupon,
} from "../../schemas/events/coupon.schemas";
import InfluencerCoupon from "../../models/events/influencer.coupon.model";

@Service()
export default class InfluencerCouponRepo {
  async getCoupons({ event }: GetCoupons["query"]) {
    return InfluencerCoupon.find({ event });
  }

  async registerCoupon(coupon: RegisterCoupon["body"] & { code: string }) {
    return InfluencerCoupon.create(coupon);
  }
}
