import { Request, Response } from "express";
import { Service } from "typedi";
import CouponServices from "../../services/events/coupon.services";
import HTTP from "../../utils/constants/http.responses";
import { RegisterCoupon } from "../../schemas/events/coupon.schemas";

@Service()
export default class CouponController {
  constructor(private readonly couponService: CouponServices) {}

  async registerCoupon(req: Request<{}, {}, RegisterCoupon["body"]>, res: Response) {
    const { id: user } = (req as any).user;

    const coupon = await this.couponService.registerCoupon({
      user,
      couponPaylaod: req.body,
    });

    return res.status(HTTP.CREATED).json(coupon);
  }
}
