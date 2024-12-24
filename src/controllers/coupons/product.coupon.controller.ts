import { Request, Response } from "express";
import { Service } from "typedi";
import HTTP from "../../utils/constants/http.responses";
import { IOrganizer } from "../../models/professionals/organizer.model";
import ProductCouponServices from "../../services/coupons/product.coupon.services";
import {
  GetProductCoupons,
  RegisterProductCoupon,
  UpdateProductCoupon,
} from "../../schemas/coupons/product.coupon.schemas";

@Service()
export default class ProductCouponController {
  constructor(private readonly service: ProductCouponServices) {}

  async getProductsCoupons(
    req: Request<{}, {}, {}, GetProductCoupons["query"]>,
    res: Response
  ) {
    const coupons = await this.service.getCoupons({
      user: ((req as any).organizer as IOrganizer)._id as string,
      query: req.query,
    });

    return res.status(HTTP.OK).json(coupons);
  }

  async registerProductsCoupon(
    req: Request<{}, {}, RegisterProductCoupon["body"]>,
    res: Response
  ) {
    const coupon = await this.service.registerCoupon({
      user: ((req as any).organizer as IOrganizer)._id as string,
      couponPayload: req.body,
    });

    return res.status(HTTP.CREATED).json(coupon);
  }

  async getProductCoupon(req: Request<{ coupon: string }>, res: Response) {
    const coupon = await this.service.getCoupon({
      code: req.params.coupon,
      id: req.params.coupon,
    });

    return res.status(HTTP.OK).json(coupon);
  }

  async updateCoupon(
    req: Request<
      UpdateProductCoupon["params"],
      {},
      UpdateProductCoupon["body"]
    >,
    res: Response
  ) {
    await this.service.updateCoupon({
      user: ((req as any).organizer as IOrganizer)._id as string,
      couponPayload: req.body,
      couponId: req.params.coupon,
    });

    return res.status(HTTP.OK).json({
      message: "Coupon mis à jour avec succès",
    });
  }
}
