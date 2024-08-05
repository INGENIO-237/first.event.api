import "reflect-metadata";

import { Router } from "express";
import validate from "../middlewares/validate.request";
import { loginSchema, resendOtpSchema } from "../schemas/auth.schemas";
import Container from "typedi";
import AuthController from "../controllers/auth.controller";
import { tryCatch } from "../utils/errors/errors.utlis";

const AuthRouter = Router();

const controller = Container.get(AuthController);

AuthRouter.post(
  "/login",
  validate(loginSchema),
  tryCatch(controller.login.bind(controller))
);

AuthRouter.post(
  "/resend-otp",
  validate(resendOtpSchema),
  tryCatch(controller.resendOtp.bind(controller))
);

export default AuthRouter;
