import "reflect-metadata";

import { raw, Router } from "express";
import Container from "typedi";
import { isLoggedIn } from "../middlewares/auth";
import { registerSubscriptionSchema } from "../schemas/subs/subscription.schemas";
import validate from "../middlewares/validate.request";
import PaymentsController from "../controllers/payments/payments.controller";
import { tryCatch } from "../utils/errors/errors.utlis";
import PaymentMethodController from "../controllers/payments/methods.controller";
import { registerPaymentMethodSchema } from "../schemas/payments/methods.schemas";

const PaymentsRouter = Router();

const payments = Container.get(PaymentsController);
const methods = Container.get(PaymentMethodController);

// Payment methods
PaymentsRouter.post(
  "/methods",
  isLoggedIn,
  validate(registerPaymentMethodSchema),
  tryCatch(methods.registerPaymentMethod.bind(methods))
);

// Subscriptions
PaymentsRouter.post(
  "/subscriptions",
  isLoggedIn,
  validate(registerSubscriptionSchema),
  tryCatch(payments.initiateSubscriptionPayment.bind(payments))
);

// Tickets

// Articles

// General webhooks
PaymentsRouter.post(
  "/webhook",
  raw({ type: "application/json" }),
  tryCatch(payments.handleWebhook.bind(payments))
);

export default PaymentsRouter;
