import "reflect-metadata";

import { Router } from "express";
import Container from "typedi";
import FollowingController from "../controllers/following.controller";
import { isLoggedIn } from "../middlewares/auth";
import validate from "../middlewares/validate.request";
import { createFollowingSchema } from "../schemas/following.schemas";
import { tryCatch } from "../utils/errors/errors.utlis";

const FollowingRouter = Router();

const controller = Container.get(FollowingController);

FollowingRouter.post(
  "",
  isLoggedIn,
  validate(createFollowingSchema),
  tryCatch(controller.create.bind(controller))
);

FollowingRouter.get(
  "",
  isLoggedIn,
  tryCatch(controller.findAll.bind(controller))
);

FollowingRouter.delete(
  "/:id",
  isLoggedIn,
  tryCatch(controller.delete.bind(controller))
);

export default FollowingRouter;
