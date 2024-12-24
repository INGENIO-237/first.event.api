import "reflect-metadata";

import { raw, Router } from "express";
import Container from "typedi";
import PaymentMethodController from "../controllers/payments/methods.controller";
import PaymentsController from "../controllers/payments/payments.controller";
import { isLoggedIn } from "../middlewares/auth";
import validate from "../middlewares/validate.request";
import { registerPaymentMethodSchema } from "../schemas/payments/methods.schemas";
import { createProductPaymentSchema } from "../schemas/payments/product.payment.schemas";
import { createTicketPaymentSchema } from "../schemas/payments/ticket.payment.schemas";
import { registerSubscriptionSchema } from "../schemas/subs/subscription.schemas";
import { tryCatch } from "../utils/errors/errors.utlis";
import { requestPaymentRefundSchema } from "../schemas/payments/refund.schemas";

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

PaymentsRouter.get(
  "/methods",
  isLoggedIn,
  tryCatch(methods.getUserPaymentMethods.bind(methods))
);

// Subscriptions
PaymentsRouter.post(
  "/subscriptions",
  isLoggedIn,
  validate(registerSubscriptionSchema),
  tryCatch(payments.initiateSubscriptionPayment.bind(payments))
);

// Tickets
PaymentsRouter.post(
  "/tickets",
  isLoggedIn,
  validate(createTicketPaymentSchema),
  tryCatch(payments.initiateTicketPayment.bind(payments))
);
PaymentsRouter.post(
  "/tickets/refund/:payment",
  isLoggedIn,
  validate(requestPaymentRefundSchema),
  tryCatch(payments.requestTicketPaymentRefund.bind(payments))
);

// Products
PaymentsRouter.post(
  "/products",
  isLoggedIn,
  validate(createProductPaymentSchema),
  tryCatch(payments.initiateProductPayment.bind(payments))
);
PaymentsRouter.post(
  "/products/refund/:payment",
  isLoggedIn,
  validate(requestPaymentRefundSchema),
  tryCatch(payments.requestProductPaymentRefund.bind(payments))
);

// General webhooks
PaymentsRouter.post(
  "/webhook",
  raw({ type: "application/json" }),
  tryCatch(payments.handleWebhook.bind(payments))
);

export default PaymentsRouter;
