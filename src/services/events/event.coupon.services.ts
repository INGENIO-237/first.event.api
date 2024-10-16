import { Service } from "typedi";
import CouponRepo from "../../repositories/events/coupon.repository";
import InfluencerCouponRepo from "../../repositories/events/influencer.coupon.repository";
import {
  GetCoupons,
  RegisterCoupon,
  UpdateCoupon,
} from "../../schemas/events/coupon.schemas";
import Event from "../../models/events/event.model";
import ApiError from "../../utils/errors/errors.base";
import HTTP from "../../utils/constants/http.responses";
import { ICoupon } from "../../models/events/coupon.model";
import { IInfluencerCoupon } from "../../models/events/influencer.coupon.model";

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
    couponPayload,
  }: {
    user: string;
    couponPayload: RegisterCoupon["body"];
  }) {
    const { event, code } = couponPayload;

    await Event.checkOwnership({ user, event });
    await Event.checkValidity(event);

    const matchingCoupon = await this.getCoupon({
      code,
      raiseException: false,
    });

    if (matchingCoupon)
      throw new ApiError(HTTP.BAD_REQUEST, "Ce coupon existe déjà");

    const { influencer, share } = couponPayload;

    let coupon;

    if (influencer && share) {
      coupon = await this.influencerCouponRepo.registerCoupon({
        ...couponPayload,
        code,
      });
    } else {
      coupon = await this.couponRepo.registerCoupon(couponPayload);
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

  async updateCoupon({
    user,
    couponPayload,
    couponId,
  }: {
    user: string;
    couponPayload: UpdateCoupon["body"];
    couponId: string;
  }) {
    const { event } = couponPayload as {
      influencer?: string | undefined;
      share?: number | undefined;
      event?: string | undefined;
      code?: string | undefined;
      discount?: number | undefined;
    };

    event && (await Event.checkOwnership({ user, event }));
    event && (await Event.checkValidity(event));

    let coupon = (await this.getCoupon({ id: couponId })) as ICoupon;
    let influencer, share;

    if (!coupon) {
      const { influencer: inf, share: sh } =
        (await this.influencerCouponRepo.getCoupon({
          id: couponId,
        })) as IInfluencerCoupon;

      influencer = inf;
      share = sh;
    }

    if (influencer && share) {
      await this.influencerCouponRepo.updateCoupon({
        couponPayload,
        coupon: couponId,
      });
    } else {
      await this.couponRepo.updateCoupon({
        couponPayload,
        coupon: couponId,
      });
    }
  }
}
