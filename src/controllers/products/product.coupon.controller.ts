import { Request, Response } from "express";
import { Service } from "typedi";
import HTTP from "../../utils/constants/http.responses";
import {
  GetCoupons,
  RegisterCoupon,
} from "../../schemas/products/product.coupon.schemas";
import ProductsCouponServices from "../../services/products/product.coupon.services";
import { IOrganizer } from "../../models/professionals/organizer.model";

@Service()
export default class ProductCouponController {
  constructor(private readonly productsCouponService: ProductsCouponServices) {}

  // Products
  async getProductsCoupons(
    req: Request<{}, {}, {}, GetCoupons["query"]>,
    res: Response
  ) {
    const { id: user } = (req as any).user;

    const coupons = await this.productsCouponService.getCoupons({
      user,
      query: req.query,
    });

    return res.status(HTTP.OK).json(coupons);
  }

  async registerProductsCoupon(
    req: Request<{}, {}, RegisterCoupon["body"]>,
    res: Response
  ) {
    const coupon = await this.productsCouponService.registerCoupon({
      user: ((req as any).organizer as IOrganizer)._id as string,
      couponPayload: req.body,
    });

    return res.status(HTTP.CREATED).json(coupon);
  }

  async getProductCoupon(req: Request<{ coupon: string }>, res: Response) {
    const coupon = await this.productsCouponService.getCoupon({
      code: req.params.coupon,
      id: req.params.coupon,
    });

    return res.status(HTTP.OK).json(coupon);
  }

  async updateCoupon(req: Request<{ coupon: string }>, res: Response) {
    const { id: user } = (req as any).user;

    await this.productsCouponService.updateCoupon({
      user,
      couponPayload: req.body,
      couponId: req.params.coupon,
    });

    return res.status(HTTP.OK).json({
      message: "Coupon mis à jour avec succès",
    });
  }
}
