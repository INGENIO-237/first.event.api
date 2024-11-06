import "reflect-metadata";

import { Request, Response, Router } from "express";
import Container from "typedi";
import { isLoggedIn } from "../middlewares/auth";
import {
  isValidOrganizer,
  validateSubscription,
} from "../middlewares/organizer";
import validate from "../middlewares/validate.request";
import { tryCatch } from "../utils/errors/errors.utlis";
import { generateCouponCode } from "../utils/utilities";
import HTTP from "../utils/constants/http.responses";
import TicketCouponController from "../controllers/coupons/ticket.coupon.controller";
import {
  getTicketCouponsSchema,
  registerTicketCouponSchema,
  updateTicketCouponSchema,
} from "../schemas/coupons/ticket.coupon.schemas";
import {
  getProductCouponsSchema,
  registerProductCouponSchema,
  updateProductCouponSchema,
} from "../schemas/coupons/product.coupon.schemas";
import ProductCouponController from "../controllers/coupons/product.coupon.controller";

const CouponsRouter = Router();

CouponsRouter.get("/generate", (req: Request, res: Response) => {
  const couponCode = generateCouponCode();

  return res.status(HTTP.CREATED).json({ couponCode });
});

const tickets = Container.get(TicketCouponController);
const products = Container.get(ProductCouponController);

// Tickets
CouponsRouter.get(
  "/events",
  isLoggedIn,
  isValidOrganizer,
  validate(getTicketCouponsSchema),
  tryCatch(tickets.getCoupons.bind(tickets))
);

CouponsRouter.post(
  "/events",
  isLoggedIn,
  isValidOrganizer,
  validateSubscription,
  validate(registerTicketCouponSchema),
  tryCatch(tickets.registerCoupon.bind(tickets))
);

CouponsRouter.get(
  "/events/:coupon",
  isLoggedIn,
  tryCatch(tickets.getCoupon.bind(tickets))
);

CouponsRouter.put(
  "/events/:coupon",
  isLoggedIn,
  isValidOrganizer,
  validateSubscription,
  validate(updateTicketCouponSchema),
  tryCatch(tickets.updateCoupon.bind(tickets))
);

// Products
CouponsRouter.get(
  "/products",
  isLoggedIn,
  isValidOrganizer,
  validate(getProductCouponsSchema),
  tryCatch(products.getProductsCoupons.bind(products))
);

CouponsRouter.post(
  "/products",
  isLoggedIn,
  isValidOrganizer,
  validateSubscription,
  validate(registerProductCouponSchema),
  tryCatch(products.registerProductsCoupon.bind(products))
);

CouponsRouter.get(
  "/products/:coupon",
  isLoggedIn,
  tryCatch(products.getProductCoupon.bind(products))
);

CouponsRouter.put(
  "/products/:coupon",
  isLoggedIn,
  isValidOrganizer,
  validateSubscription,
  validate(updateProductCouponSchema),
  tryCatch(products.updateCoupon.bind(products))
);

export default CouponsRouter;
