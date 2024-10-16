import { Service } from "typedi";
import {
  GetCoupons,
  RegisterCoupon,
  UpdateCoupon,
} from "../../schemas/products/product.coupon.schemas";
import ApiError from "../../utils/errors/errors.base";
import HTTP from "../../utils/constants/http.responses";
import Product from "../../models/products/product.model";
import CouponRepo from "../../repositories/products/product.coupon.repository";
import InfluencerCouponRepo from "../../repositories/products/product.influencer.coupon.repository";
import { IProductCoupon } from "../../models/products/product.coupon.model";
import { IProductInfluencerCoupon } from "../../models/products/product.influencer.coupon.model";

@Service()
export default class ProductsCouponServices {
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
    const { product } = query;

    await Product.isOwner(product, user);

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
    const { product, code } = couponPayload;

    await Product.isOwner(product, user);

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
        code: "PC-" + code,
      });
    } else {
      coupon = await this.couponRepo.registerCoupon({
        ...couponPayload,
        code: "PC-" + code,
      });
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
    const { product } = couponPayload as {
      influencer?: string | undefined;
      share?: number | undefined;
      product?: string | undefined;
      code?: string | undefined;
      discount?: number | undefined;
    };

    product && (await Product.isOwner(product, user));

    let coupon = (await this.getCoupon({ id: couponId })) as IProductCoupon;
    let influencer, share;

    if (!coupon) {
      const { influencer: inf, share: sh } =
        (await this.influencerCouponRepo.getCoupon({
          id: couponId,
        })) as IProductInfluencerCoupon;

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
