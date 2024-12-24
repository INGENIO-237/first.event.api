import "reflect-metadata";

import { Router } from "express";
import Container from "typedi";
import InfluencerReviewsController from "../controllers/reviews/influencer.review.controller";
import OrganizerReviewsController from "../controllers/reviews/organizer.review.controller";
import { isLoggedIn } from "../middlewares/auth";
import { isValidOrganizer } from "../middlewares/professionals";
import validate from "../middlewares/validate.request";
import {
  createInfluencerReviewSchema,
  getInfluencerReviewsSchema,
} from "../schemas/reviews/influencer.review.schemas";
import {
  createOrganizerReviewSchema,
  getOrganizerReviewsSchema,
} from "../schemas/reviews/organizer.review.schemas";
import { tryCatch } from "../utils/errors/errors.utlis";

const ReviewsRouter = Router();

const organizers = Container.get(OrganizerReviewsController);
const influencers = Container.get(InfluencerReviewsController);

ReviewsRouter.post(
  "/organizers",
  isLoggedIn,
  validate(createOrganizerReviewSchema),
  tryCatch(organizers.createReview.bind(organizers))
);

ReviewsRouter.get(
  "/organizers",
  isLoggedIn,
  validate(getOrganizerReviewsSchema),
  tryCatch(organizers.getReviews.bind(organizers))
);

ReviewsRouter.post(
  "/influencers",
  isLoggedIn,
  isValidOrganizer,
  validate(createInfluencerReviewSchema),
  tryCatch(influencers.createReview.bind(influencers))
);

ReviewsRouter.get(
  "/influencers",
  isLoggedIn,
  isValidOrganizer,
  validate(getInfluencerReviewsSchema),
  tryCatch(influencers.getReviews.bind(influencers))
);

export default ReviewsRouter;
