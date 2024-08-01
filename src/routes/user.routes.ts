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
  "",
  validate(registerUserSchema),
  tryCatch(controller.registerUser.bind(controller))
);

export default UserRouter;
