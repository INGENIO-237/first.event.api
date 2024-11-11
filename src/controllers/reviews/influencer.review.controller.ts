import { Request, Response } from "express";
import { Service } from "typedi";
import { CreateInfluencerReviewInput, GetInfluencerReviewsInput } from "../../schemas/reviews/influencer.review.schemas";
import InfluencerReviewServices from "../../services/reviews/influencer.review.services";
import HTTP from "../../utils/constants/http.responses";

@Service()
export default class InfluencerReviewsController {
  constructor(private readonly service: InfluencerReviewServices) {}

  async createReview(
    req: Request<{}, {}, CreateInfluencerReviewInput["body"]>,
    res: Response
  ) {
    const review = await this.service.createReview({
      ...req.body,
      user: (req as any).user.id,
    });

    res.status(HTTP.CREATED).json(review);
  }

  async getReviews(
    req: Request<{}, {}, {}, GetInfluencerReviewsInput["query"]>,
    res: Response
  ) {
    const reviews = await this.service.getReviews(req.query);

    res.status(HTTP.CREATED).json(reviews);
  }
}
