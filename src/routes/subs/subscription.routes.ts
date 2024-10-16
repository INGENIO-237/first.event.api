import "reflect-metadata";

import { Router } from "express";
import { isAdmin, isLoggedIn } from "../../middlewares/auth";
import Container from "typedi";
import { tryCatch } from "../../utils/errors/errors.utlis";
import SubscriptionController from "../../controllers/subs/subscription.controller";

const SubscriptionRouter = Router();

const controller = Container.get(SubscriptionController);

SubscriptionRouter.post(
  "/cancel",
  isLoggedIn,
  tryCatch(controller.cancelSubscription.bind(controller))
);

SubscriptionRouter.use(isAdmin);

// TODO: Get list of subscriptions

export default SubscriptionRouter;
