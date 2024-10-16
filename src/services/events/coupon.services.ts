import { Service } from "typedi";
import CouponRepo from "../../repositories/events/coupon.repository";
import InfluencerCouponRepo from "../../repositories/events/influencer.coupon.repository";
import {
  GetCoupons,
  RegisterCoupon,
} from "../../schemas/events/coupon.schemas";
import crypto from "node:crypto";
import { alphabet } from "../../utils/constants/common";
import Event from "../../models/events/event.model";

@Service()
export default class CouponServices {
  constructor(
    private readonly couponRepo: CouponRepo,
    private readonly influencerCouponRepo: InfluencerCouponRepo
  ) {}

  async getCoupons({
    query,
    user,
  }: {
    user: string;
    query: GetCoupons["query"];
  }) {
    const { event } = query;

    await Event.checkOwnership({ user, event });

    const coupons = await this.couponRepo.getCoupons(query);
    const influencerCoupons = await this.influencerCouponRepo.getCoupons(query);

    return [...coupons, ...influencerCoupons];
  }

  async registerCoupon({
    user,
    couponPaylaod,
  }: {
    user: string;
    couponPaylaod: RegisterCoupon["body"];
  }) {
    const { event } = couponPaylaod;

    await Event.checkOwnership({ user, event });
    await Event.checkValidity(event);

    const { influencer, share } = couponPaylaod;

    let coupon;

    const code = this.generateCouponCode();

    if (influencer && share) {
      coupon = await this.influencerCouponRepo.registerCoupon({
        ...couponPaylaod,
        code,
      });
    } else {
      coupon = await this.couponRepo.registerCoupon({ ...couponPaylaod, code });
    }

    return coupon;
  }

  private generateCouponCode(options?: {
    length?: number;
    type?: "ticket" | "article";
  }) {
    const length = options ? options.length || 5 : 5;
    const type = options ? options.type || "ticket" : "ticket";

    const prefix = type === "ticket" ? "TC-" : "AC-";
    const bytes = crypto.randomBytes(length);
    let code = "";
    for (let i = 0; i < length; i++) {
      code += alphabet[bytes[i] % alphabet.length];
    }

    return prefix + code;
  }
}
