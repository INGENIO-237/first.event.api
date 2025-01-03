import "reflect-metadata";

import { Router } from "express";
import validate from "../middlewares/validate.request";
import {
  registerUserSchema,
  updateAddressesSchema,
  updateCredentialsSchema,
  updateGeneralInfoSchema,
  updateInterestsSchema,
} from "../schemas/user.schemas";
import Container from "typedi";
import UserController from "../controllers/user.controller";
import { tryCatch } from "../utils/errors/errors.utlis";
import { isAdmin, isLoggedIn } from "../middlewares/auth";
import MulterServices from "../services/utils/multer.services";
import { imageUploader } from "../middlewares/cloudinary";

const UserRouter = Router();

const controller = Container.get(UserController);
const multer = Container.get(MulterServices);

const uploader = multer.uploader;

UserRouter.get(
  "",
  isLoggedIn,
  isAdmin,
  tryCatch(controller.getUsers.bind(controller))
);

UserRouter.post(
  "/register",
  validate(registerUserSchema),
  tryCatch(controller.registerUser.bind(controller))
);

UserRouter.put(
  "/general-info",
  isLoggedIn,
  uploader.single("image"),
  validate(updateGeneralInfoSchema),
  imageUploader,
  tryCatch(controller.updateGeneralInfo.bind(controller))
);

UserRouter.put(
  "/credentials",
  isLoggedIn,
  validate(updateCredentialsSchema),
  tryCatch(controller.updateCredentials.bind(controller))
);

UserRouter.put(
  "/interests",
  isLoggedIn,
  validate(updateInterestsSchema),
  tryCatch(controller.updateInterests.bind(controller))
);

UserRouter.put(
  "/addresses",
  isLoggedIn,
  validate(updateAddressesSchema),
  tryCatch(controller.updateAddresses.bind(controller))
);

export default UserRouter;
