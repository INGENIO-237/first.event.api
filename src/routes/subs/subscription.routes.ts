import "reflect-metadata";

import { Router } from "express";
import validate from "../../middlewares/validate.request";
import { isAdmin, isLoggedIn } from "../../middlewares/auth";
import Container from "typedi";
import { tryCatch } from "../../utils/errors/errors.utlis";
import SubscriptionController from "../../controllers/subs/subscription.controller";

const SubscriptionRouter = Router();

const controller = Container.get(SubscriptionController);

// TODO: Request a subscription cancellation
SubscriptionRouter.post(
  "/cancel",
  isLoggedIn,
  tryCatch(controller.cancelSubscription.bind(controller))
);

SubscriptionRouter.use(isAdmin);

// TODO: Get list of subscriptions

export default SubscriptionRouter;
