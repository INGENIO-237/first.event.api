import "reflect-metadata";

import { Router } from "express";
import { isAdmin, isLoggedIn } from "../../middlewares/auth";
import Container from "typedi";
import { tryCatch } from "../../utils/errors/errors.utlis";
import SubscriptionController from "../../controllers/subs/subscription.controller";

const SubscriptionRouter = Router();

const controller = Container.get(SubscriptionController);

SubscriptionRouter.use(isLoggedIn);

SubscriptionRouter.post(
  "/cancel",
  tryCatch(controller.cancelSubscription.bind(controller))
);

SubscriptionRouter.get(
  "",
  tryCatch(controller.getSubscriptions.bind(controller))
);

export default SubscriptionRouter;
