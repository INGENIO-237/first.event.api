import "reflect-metadata";

import { Router } from "express";
import validate from "../../middlewares/validate.request";
import Container from "typedi";
import { tryCatch } from "../../utils/errors/errors.utlis";
import OrganizerController from "../../controllers/professionals/organizer.controller";
import { registerOrganizerSchema } from "../../schemas/professionals/organizer.schemas";
import { isLoggedIn } from "../../middlewares/auth";

const OrganizerRouter = Router();

const controller = Container.get(OrganizerController);

OrganizerRouter.post(
  "/register",
  validate(registerOrganizerSchema),
  isLoggedIn,
  tryCatch(controller.registerOrganizer.bind(controller))
);

export default OrganizerRouter;
