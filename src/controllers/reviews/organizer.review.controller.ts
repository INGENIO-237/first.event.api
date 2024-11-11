import { Request, Response } from "express";
import { Service } from "typedi";
import { CreateOrganizerReviewInput, GetOrganizerReviewsInput } from "../../schemas/reviews/organizer.review.schemas";
import OrganizerReviewServices from "../../services/reviews/organizer.review.services";
import HTTP from "../../utils/constants/http.responses";

@Service()
export default class OrganizerReviewsController {
  constructor(private readonly service: OrganizerReviewServices) {}

  async createReview(
    req: Request<{}, {}, CreateOrganizerReviewInput["body"]>,
    res: Response
  ) {
    const review = await this.service.createReview({
      ...req.body,
      user: (req as any).user.id,
    });

    res.status(HTTP.CREATED).json(review);
  }

  async getReviews(
    req: Request<{}, {}, {}, GetOrganizerReviewsInput["query"]>,
    res: Response
  ) {
    const reviews = await this.service.getReviews(req.query);

    res.status(HTTP.CREATED).json(reviews);
  }
}
