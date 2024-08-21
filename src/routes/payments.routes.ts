import "reflect-metadata";

import { raw, Router } from "express";
import Container from "typedi";
import { isLoggedIn } from "../middlewares/auth";
import { registerSubscriptionSchema } from "../schemas/subs/subscription.schemas";
import validate from "../middlewares/validate.request";
import PaymentsController from "../controllers/payments/payments.controller";

const PaymentsRouter = Router();

const payments = Container.get(PaymentsController);

// Subscriptions
PaymentsRouter.post(
  "/subscriptions",
  isLoggedIn,
  validate(registerSubscriptionSchema),
  payments.initiateSubscriptionPayment.bind(payments)
);

// Tickets

// Articles

// General webhooks
PaymentsRouter.post(
  "/webhook",
  raw({ type: "application/json" }),
  payments.handleWebhook.bind(payments)
);

export default PaymentsRouter;
