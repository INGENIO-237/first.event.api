import "reflect-metadata";

import { Router } from "express";
import validate from "../../middlewares/validate.request";
import { isLoggedIn } from "../../middlewares/auth";
import { registerSubscriptionSchema } from "../../schemas/subs/subscription.schemas";
import Container from "typedi";
import SubscriptionPaymentController from "../../controllers/payments/subscription.payments.controller";

const SubscriptionRouter = Router();

const subsPayment = Container.get(SubscriptionPaymentController);

SubscriptionRouter.post(
  "/register",
  isLoggedIn,
  validate(registerSubscriptionSchema),
  subsPayment.registerSubscription.bind(subsPayment)
);

export default SubscriptionRouter;
