import { Request, Response } from "express";
import { Service } from "typedi";
import TicketsCouponServices from "../../services/events/event.coupon.services";
import HTTP from "../../utils/constants/http.responses";
import {
  GetCoupons,
  RegisterCoupon,
} from "../../schemas/events/coupon.schemas";

@Service()
export default class CouponController {
  constructor(private readonly ticketsCouponService: TicketsCouponServices) {}

  

  // Events
  async getTicketsCoupons(
    req: Request<{}, {}, {}, GetCoupons["query"]>,
    res: Response
  ) {
    const { id: user } = (req as any).user;

    const coupons = await this.ticketsCouponService.getCoupons({
      user,
      query: req.query,
    });

    return res.status(HTTP.OK).json(coupons);
  }

  async registerTicketsCoupon(
    req: Request<{}, {}, RegisterCoupon["body"]>,
    res: Response
  ) {
    const { id: user } = (req as any).user;

    const coupon = await this.ticketsCouponService.registerCoupon({
      user,
      couponPaylaod: req.body,
    });

    return res.status(HTTP.CREATED).json(coupon);
  }

  async getTicketCoupon(req: Request<{ coupon: string }>, res: Response) {
    const coupon = await this.ticketsCouponService.getCoupon({
      code: req.params.coupon,
      id: req.params.coupon,
    });

    return res.status(HTTP.OK).json(coupon);
  }
}
