import "reflect-metadata";

import { Router } from "express";
import Container from "typedi";
import CouponController from "../../controllers/events/coupon.controller";
import { isLoggedIn } from "../../middlewares/auth";
import { isValidOrganizer } from "../../middlewares/organizer";
import validate from "../../middlewares/validate.request";
import { tryCatch } from "../../utils/errors/errors.utlis";
import { registerCouponSchema } from "../../schemas/events/coupon.schemas";

const CouponsRouter = Router();

const controller = Container.get(CouponController);

CouponsRouter.post(
  "/events",
  isLoggedIn,
  isValidOrganizer,
  validate(registerCouponSchema),
  tryCatch(controller.registerCoupon.bind(controller))
);



export default CouponsRouter;
