import "reflect-metadata";

import { Router } from "express";
import validate from "../middlewares/validate.request";
import { registerUserSchema } from "../schemas/user.schemas";
import Container from "typedi";
import UserController from "../controllers/user.controller";
import { tryCatch } from "../utils/errors/errors.utlis";

const UserRouter = Router();

const controller = Container.get(UserController);

UserRouter.post(
  "/register",
  validate(registerUserSchema),
  tryCatch(controller.registerUser.bind(controller))
);

// TODO: Ensure user has proper permission to access this resource
UserRouter.get("", tryCatch(controller.getUsers.bind(controller)));

export default UserRouter;
