import { Service } from "typedi";
import ApiError from "../../utils/errors/errors.base";
import HTTP from "../../utils/constants/http.responses";
import Product from "../../models/products/product.model";
import ProductCouponRepo from "../../repositories/coupons/product.coupon.repository";
import {
  GetProductCoupons,
  RegisterProductCoupon,
  UpdateProductCoupon,
} from "../../schemas/coupons/product.coupon.schemas";
import { IProductCoupon } from "../../models/coupons/product.coupon.model";

@Service()
export default class ProductCouponServices {
  constructor(private readonly repository: ProductCouponRepo) {}

  async getCoupons({
    query,
    user,
  }: {
    user: string;
    query: GetProductCoupons["query"];
  }) {
    const { product } = query;

    await Product.isOwner(product, user);

    const coupons = await this.repository.getCoupons(query);

    return coupons;
  }

  async registerCoupon({
    user,
    couponPayload,
  }: {
    user: string;
    couponPayload: RegisterProductCoupon["body"];
  }) {
    const { product, code } = couponPayload;

    await Product.isOwner(product, user);

    const matchingCoupon = await this.getCoupon({
      code,
      raiseException: false,
    });

    if (matchingCoupon)
      throw new ApiError(HTTP.BAD_REQUEST, "Ce coupon existe déjà");

    let coupon = await this.repository.registerCoupon({
      ...couponPayload,
      code,
    });

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

    const coupon = await this.repository.getCoupon(query);

    if (!coupon && raiseException) {
      throw new ApiError(HTTP.NOT_FOUND, "Coupon non trouvé");
    }

    return coupon;
  }

  async updateCoupon({
    user,
    couponPayload,
    couponId,
  }: {
    user: string;
    couponPayload: UpdateProductCoupon["body"];
    couponId: string;
  }) {
    const { product } = (await this.getCoupon({
      id: couponId,
    })) as IProductCoupon;

    product && (await Product.isOwner(product.toString(), user));

    await this.repository.updateCoupon({
      couponPayload,
      coupon: couponId,
    });
  }
}
