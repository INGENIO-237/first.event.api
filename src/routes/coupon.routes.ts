import "reflect-metadata";

import { Request, Response, Router } from "express";
import Container from "typedi";
import CouponController from "../controllers/events/coupon.controller";
import { isLoggedIn } from "../middlewares/auth";
import {
  isValidOrganizer,
  validateSubscription,
} from "../middlewares/organizer";
import validate from "../middlewares/validate.request";
import { tryCatch } from "../utils/errors/errors.utlis";
import {
  getCouponsSchema,
  registerCouponSchema,
  updateCouponSchema,
} from "../schemas/events/coupon.schemas";
import { generateCouponCode } from "../utils/utilities";
import HTTP from "../utils/constants/http.responses";
import {
  getProductCouponsSchema,
  registerProductCouponSchema,
  updateProductCouponSchema,
} from "../schemas/products/product.coupon.schemas";
import ProductCouponController from "../controllers/products/product.coupon.controller";

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
const productController = Container.get(ProductCouponController);

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

CouponsRouter.put(
  "/events/:coupon",
  isLoggedIn,
  isValidOrganizer,
  validateSubscription,
  validate(updateCouponSchema),
  tryCatch(controller.updateCoupon.bind(controller))
);

// Products
CouponsRouter.get(
  "/products",
  isLoggedIn,
  isValidOrganizer,
  validate(getProductCouponsSchema),
  tryCatch(productController.getProductsCoupons.bind(productController))
);

CouponsRouter.post(
  "/products",
  isLoggedIn,
  isValidOrganizer,
  validateSubscription,
  validate(registerProductCouponSchema),
  tryCatch(productController.registerProductsCoupon.bind(productController))
);

CouponsRouter.get(
  "/products/:coupon",
  isLoggedIn,
  tryCatch(productController.getProductCoupon.bind(productController))
);

CouponsRouter.put(
  "/products/:coupon",
  isLoggedIn,
  isValidOrganizer,
  validateSubscription,
  validate(updateProductCouponSchema),
  tryCatch(productController.updateCoupon.bind(productController))
);

export default CouponsRouter;
