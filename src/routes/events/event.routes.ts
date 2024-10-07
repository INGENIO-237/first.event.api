import "reflect-metadata";

import { Router } from "express";
import Container from "typedi";
import MulterServices from "../../services/utils/multer.services";
import validate from "../../middlewares/validate.request";
import { createEventSchema } from "../../schemas/events/event.schemas";
import { imageUploader } from "../../middlewares/cloudinary";
import EventController from "../../controllers/events/event.controller";
import { isValidOrganizer } from "../../middlewares/organizer";
import { tryCatch } from "../../utils/errors/errors.utlis";
import { isLoggedIn } from "../../middlewares/auth";
import { parseLocation, parseTickets } from "../../middlewares/parse-fields"

const EventsRouter = Router();

const controller = Container.get(EventController);
const multer = Container.get(MulterServices);

const uploader = multer.uploader;

EventsRouter.post(
  "",
  isLoggedIn,
  isValidOrganizer,
  uploader.single("image"),
  imageUploader,
  parseTickets,
  parseLocation,
  validate(createEventSchema),
  tryCatch(controller.createEvent.bind(controller))
);

export default EventsRouter;
