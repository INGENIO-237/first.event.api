import { Service } from "typedi";
import TicketCouponServices from "../../services/coupons/ticket.coupon.services";
import {
  GetTicketCoupons,
  RegisterTicketCoupon,
  UpdateTicketCoupon,
} from "../../schemas/coupons/ticket.coupon.schemas";
import { Request, Response } from "express";
import HTTP from "../../utils/constants/http.responses";

@Service()
export default class TicketCouponController {
  constructor(private readonly service: TicketCouponServices) {}

  async getCoupons(
    req: Request<{}, {}, {}, GetTicketCoupons["query"]>,
    res: Response
  ) {
    const { id: user } = (req as any).user;

    const coupons = await this.service.getCoupons({
      user,
      query: req.query,
    });

    return res.status(HTTP.OK).json(coupons);
  }

  async registerCoupon(
    req: Request<{}, {}, RegisterTicketCoupon["body"]>,
    res: Response
  ) {
    const { id: user } = (req as any).user;

    const coupon = await this.service.registerCoupon({
      user,
      couponPayload: req.body,
    });

    return res.status(HTTP.CREATED).json(coupon);
  }

  async getCoupon(req: Request<{ coupon: string }>, res: Response) {
    const coupon = await this.service.getCoupon({
      code: req.params.coupon,
      id: req.params.coupon,
    });

    return res.status(HTTP.OK).json(coupon);
  }

  async updateCoupon(
    req: Request<UpdateTicketCoupon["params"], {}, UpdateTicketCoupon["body"]>,
    res: Response
  ) {
    const { id: user } = (req as any).user;

    await this.service.updateCoupon({
      user,
      couponPayload: req.body,
      couponId: req.params.coupon,
    });

    return res.status(HTTP.OK).json({
      message: "Coupon mis à jour avec succès",
    });
  }
}
