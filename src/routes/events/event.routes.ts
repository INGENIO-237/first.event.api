import "reflect-metadata";

import { Router } from "express";
import Container from "typedi";
import MulterServices from "../../services/utils/multer.services";
import validate from "../../middlewares/validate.request";
import {
  createEventSchema,
  getEventsSchema,
  updateEventSchema,
} from "../../schemas/events/event.schemas";
import { imageUploader } from "../../middlewares/cloudinary";
import EventController from "../../controllers/events/event.controller";
import {
  isValidOrganizer,
  validateSubscription,
} from "../../middlewares/professionals";
import { tryCatch } from "../../utils/errors/errors.utlis";
import { isLoggedIn } from "../../middlewares/auth";
import {
  parseBodyLocation,
  parseQueryLocation,
  parseTickets,
} from "../../middlewares/parse-fields";

const EventsRouter = Router();

const controller = Container.get(EventController);
const multer = Container.get(MulterServices);

const uploader = multer.uploader;

EventsRouter.get(
  "",
  parseQueryLocation,
  validate(getEventsSchema),
  tryCatch(controller.getEvents.bind(controller))
);

EventsRouter.post(
  "",
  isLoggedIn,
  isValidOrganizer,
  validateSubscription,
  uploader.single("image"),
  imageUploader,
  parseTickets,
  parseBodyLocation,
  validate(createEventSchema),
  tryCatch(controller.createEvent.bind(controller))
);

EventsRouter.put(
  "/:event",
  isLoggedIn,
  isValidOrganizer,
  validateSubscription,
  uploader.single("image"),
  imageUploader,
  parseTickets,
  parseBodyLocation,
  validate(updateEventSchema),
  tryCatch(controller.updateEvent.bind(controller))
);

export default EventsRouter;
