import "reflect-metadata";

import { Router } from "express";
import validate from "../../middlewares/validate.request";
import Container from "typedi";
import { tryCatch } from "../../utils/errors/errors.utlis";
import InfluencerController from "../../controllers/professionals/influencer.controller";
import { registerInfluencerSchema, updateInfluencerSchema } from "../../schemas/professionals/influencer.schemas";
import { isLoggedIn } from "../../middlewares/auth";

const InfluencerRouter = Router();

const controller = Container.get(InfluencerController);

InfluencerRouter.post(
  "/register",
  validate(registerInfluencerSchema),
  isLoggedIn,
  tryCatch(controller.registerInfluencer.bind(controller))
);

InfluencerRouter.put(
  "",
  validate(updateInfluencerSchema),
  isLoggedIn,
  tryCatch(controller.updateInfluencer.bind(controller))
);

export default InfluencerRouter;
