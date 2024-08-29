import "reflect-metadata";

import { Router } from "express";
import validate from "../../middlewares/validate.request";
import { isAdmin, isLoggedIn } from "../../middlewares/auth";
import Container from "typedi";
import SubscriptionPaymentController from "../../controllers/payments/subscription.payments.controller";

const SubscriptionRouter = Router();

const subsPayment = Container.get(SubscriptionPaymentController);

// TODO: Request a subscription cancellation

SubscriptionRouter.use(isAdmin);

// TODO: Get list of subscriptions

export default SubscriptionRouter;
