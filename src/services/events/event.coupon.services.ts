import { Service } from "typedi";
import CouponRepo from "../../repositories/events/coupon.repository";
import InfluencerCouponRepo from "../../repositories/events/influencer.coupon.repository";
import {
  GetCoupons,
  RegisterCoupon,
} from "../../schemas/events/coupon.schemas";
import Event from "../../models/events/event.model";
import ApiError from "../../utils/errors/errors.base";
import HTTP from "../../utils/constants/http.responses";
import { generateCouponCode } from "../../utils/coupons";

@Service()
export default class TicketsCouponServices {
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
    const { event, code } = couponPaylaod;

    await Event.checkOwnership({ user, event });
    await Event.checkValidity(event);

    const matchingCoupon = await this.getCoupon({ code, raiseException: false });

    if(matchingCoupon) throw new ApiError(HTTP.BAD_REQUEST, "Ce coupon existe déjà");

    const { influencer, share } = couponPaylaod;

    let coupon;

    if (influencer && share) {
      coupon = await this.influencerCouponRepo.registerCoupon({
        ...couponPaylaod,
        code,
      });
    } else {
      coupon = await this.couponRepo.registerCoupon(couponPaylaod);
    }

    return coupon;
  }

  async getCoupon({
    raiseException = true,
    ...query
  }: {
    code?: string;
    id?: string;
    raiseException?: boolean;
  }) {
    if (!query.code && !query.id)
      throw new ApiError(
        HTTP.BAD_REQUEST,
        "Veuillez passer soit l'identifiant ou le code du coupon"
      );

    const coupon = await this.couponRepo.getCoupon(query);
    const influencerCoupon = await this.influencerCouponRepo.getCoupon(query);

    if (!coupon && !influencerCoupon && raiseException) {
      throw new ApiError(HTTP.NOT_FOUND, "Coupon non trouvé");
    }

    return coupon ? coupon : influencerCoupon;
  }
}
