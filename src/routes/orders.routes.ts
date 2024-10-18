import "reflect-metadata";

import { Router } from "express";
import Container from "typedi";
import TicketOrderController from "../controllers/orders/ticket.order.controller";
import { isLoggedIn } from "../middlewares/auth";
import { tryCatch } from "../utils/errors/errors.utlis";
import validate from "../middlewares/validate.request";
import { createTicketOrderSchema } from "../schemas/orders/ticket.order.schemas";

const OrdersRouter = Router();

// tickets
const ticketOrderController = Container.get(TicketOrderController);

OrdersRouter.post(
  "/tickets",
  isLoggedIn,
  validate(createTicketOrderSchema),
  tryCatch(ticketOrderController.createTicketOrder.bind(ticketOrderController))
);

export default OrdersRouter;
