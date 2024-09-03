import "reflect-metadata";

import { Router } from "express";
import validate from "../../middlewares/validate.request";
import { isAdmin, isLoggedIn } from "../../middlewares/auth";
import Container from "typedi";
import { SubscriptionController } from "../../controllers/subs";

const SubscriptionRouter = Router();

const controller = Container.get(SubscriptionController)

// TODO: Request a subscription cancellation

SubscriptionRouter.use(isAdmin);

// TODO: Get list of subscriptions

export default SubscriptionRouter;
