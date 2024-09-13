import "reflect-metadata";

import { Router } from "express";
import validate from "../middlewares/validate.request";
import { loginSchema, resetPwd, verifSchema } from "../schemas/auth.schemas";
import Container from "typedi";
import AuthController from "../controllers/auth.controller";
import { tryCatch } from "../utils/errors/errors.utlis";
import { isLoggedIn } from "../middlewares/auth";

const AuthRouter = Router();

const controller = Container.get(AuthController);

AuthRouter.post(
  "/login",
  validate(loginSchema),
  tryCatch(controller.login.bind(controller))
);

AuthRouter.get(
  "/current",
  isLoggedIn,
  tryCatch(controller.getCurrentUser.bind(controller))
);

AuthRouter.post(
  "/resend-otp",
  validate(verifSchema),
  tryCatch(controller.resendOtp.bind(controller))
);

AuthRouter.post(
  "/forgot-password",
  validate(verifSchema),
  tryCatch(controller.forgotPwdRequest.bind(controller))
);

AuthRouter.post(
  "/reset-password",
  validate(resetPwd),
  tryCatch(controller.resetPwd.bind(controller))
);

export default AuthRouter;
