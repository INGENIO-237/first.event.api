import "reflect-metadata";

import { Router } from "express";
import { isLoggedIn } from "../middlewares/auth";
import Container from "typedi";
import CartController from "../controllers/cart.controller";
import { tryCatch } from "../utils/errors/errors.utlis";
import validate from "../middlewares/validate.request";
import { addCartItemSchema } from "../schemas/cart.schemas";

const CartRouter = Router();

const controller = Container.get(CartController);

CartRouter.get("", isLoggedIn, tryCatch(controller.getCart.bind(controller)));
CartRouter.post(
  "",
  isLoggedIn,
  validate(addCartItemSchema),
  tryCatch(controller.addItem.bind(controller))
);
CartRouter.delete(
  "/:product",
  isLoggedIn,
  tryCatch(controller.removeItem.bind(controller))
);
CartRouter.delete(
  "",
  isLoggedIn,
  tryCatch(controller.clearCart.bind(controller))
);

export default CartRouter;
