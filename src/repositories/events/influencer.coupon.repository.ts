import { Service } from "typedi";
import { RegisterCoupon } from "../../schemas/events/coupon.schemas";
import InfluencerCoupon from "../../models/events/influencer.coupon.model";

@Service()
export default class InfluencerCouponRepo {
  async registerCoupon(coupon: RegisterCoupon["body"] & {code: string}) {
    return InfluencerCoupon.create(coupon);
  }
}
