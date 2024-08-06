import "reflect-metadata";

import { Router } from "express";
import validate from "../middlewares/validate.request";
import {
  registerUserSchema,
  updateGeneralInfoSchema,
} from "../schemas/user.schemas";
import Container from "typedi";
import UserController from "../controllers/user.controller";
import { tryCatch } from "../utils/errors/errors.utlis";
import { isAdmin, isLoggedIn } from "../middlewares/auth";
import MulterServices from "../services/multer.services";

const UserRouter = Router();

const controller = Container.get(UserController);
const multer = Container.get(MulterServices);

const uploader = multer.uploader;

UserRouter.post(
  "/register",
  validate(registerUserSchema),
  tryCatch(controller.registerUser.bind(controller))
);

// TODO: Ensure this is accessed only by admin
UserRouter.get("", isAdmin, tryCatch(controller.getUsers.bind(controller)));

UserRouter.put(
  "/general-info",
  isLoggedIn,
  uploader.single("image"),
  validate(updateGeneralInfoSchema),
  // TODO: Upload to cloudinary,
  tryCatch(controller.updateGeneralInfo.bind(controller))
);

export default UserRouter;
