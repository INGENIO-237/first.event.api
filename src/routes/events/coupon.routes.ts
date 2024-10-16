import "reflect-metadata";

import { Router } from "express";
import Container from "typedi";
import CouponController from "../../controllers/events/coupon.controller";
import { isLoggedIn } from "../../middlewares/auth";
import { isValidOrganizer, validateSubscription } from "../../middlewares/organizer";
import validate from "../../middlewares/validate.request";
import { tryCatch } from "../../utils/errors/errors.utlis";
import { getCouponsSchema, registerCouponSchema } from "../../schemas/events/coupon.schemas";

const CouponsRouter = Router();

const controller = Container.get(CouponController);

CouponsRouter.get(
  "/events",
  isLoggedIn,
  isValidOrganizer,
  validate(getCouponsSchema),
  tryCatch(controller.getCoupons.bind(controller))
);

CouponsRouter.post(
  "/events",
  isLoggedIn,
  isValidOrganizer,
  validateSubscription,
  validate(registerCouponSchema),
  tryCatch(controller.registerCoupon.bind(controller))
);



export default CouponsRouter;
