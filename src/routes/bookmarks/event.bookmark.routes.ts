import "reflect-metadata";

import { Router } from "express";
import Container from "typedi";
import EventBookmarkController from "../../controllers/bookmarks/event.bookmark.controller";
import { isLoggedIn } from "../../middlewares/auth";
import validate from "../../middlewares/validate.request";
import { createEventBookmarkSchema } from "../../schemas/bookmarks/event.bookmar.schemas";
import { tryCatch } from "../../utils/errors/errors.utlis";

const EventBookmarkRouter = Router();

const controller = Container.get(EventBookmarkController);

EventBookmarkRouter.post(
  "",
  isLoggedIn,
  validate(createEventBookmarkSchema),
  tryCatch(controller.create.bind(controller))
);

EventBookmarkRouter.get(
  "",
  isLoggedIn,
  tryCatch(controller.findAll.bind(controller))
);

EventBookmarkRouter.delete(
  "/:bookmark",
  isLoggedIn,
  tryCatch(controller.delete.bind(controller))
);

export default EventBookmarkRouter;
