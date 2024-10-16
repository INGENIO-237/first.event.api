import "reflect-metadata";

import { Request, Response, Router } from "express";
import Container from "typedi";
import CouponController from "../../controllers/events/coupon.controller";
import { isLoggedIn } from "../../middlewares/auth";
import {
  isValidOrganizer,
  validateSubscription,
} from "../../middlewares/organizer";
import validate from "../../middlewares/validate.request";
import { tryCatch } from "../../utils/errors/errors.utlis";
import {
  getCouponsSchema,
  registerCouponSchema,
} from "../../schemas/events/coupon.schemas";
import { generateCouponCode } from "../../utils/coupons";
import HTTP from "../../utils/constants/http.responses";

const CouponsRouter = Router();

CouponsRouter.get(
  "/generate",
  (req: Request<{}, {}, {}, { type: "ticket" | "article" }>, res: Response) => {
    const { type } = req.query;

    const couponCode = generateCouponCode({ type });

    return res.status(HTTP.CREATED).json({ couponCode });
  }
);

const controller = Container.get(CouponController);

// Events
CouponsRouter.get(
  "/events",
  isLoggedIn,
  isValidOrganizer,
  validate(getCouponsSchema),
  tryCatch(controller.getTicketsCoupons.bind(controller))
);

CouponsRouter.post(
  "/events",
  isLoggedIn,
  isValidOrganizer,
  validateSubscription,
  validate(registerCouponSchema),
  tryCatch(controller.registerTicketsCoupon.bind(controller))
);

CouponsRouter.get(
  "/events/:coupon",
  isLoggedIn,
  tryCatch(controller.getTicketCoupon.bind(controller))
);

export default CouponsRouter;
