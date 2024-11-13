import { ObjectId } from "mongoose";
import { Service } from "typedi";
import InfluencerReviewRepo from "../../repositories/reviews/influencer.review.repository";
import {
  CreateInfluencerReviewPayload,
  GetInfluencerReviewsInput,
} from "../../schemas/reviews/influencer.review.schemas";
import HTTP from "../../utils/constants/http.responses";
import ApiError from "../../utils/errors/errors.base";
import InfluencerServices from "../professionals/influencer.services";

@Service()
export default class InfluencerReviewServices {
  constructor(
    private readonly repository: InfluencerReviewRepo,
    private readonly influencerService: InfluencerServices
  ) {}

  async createReview(data: CreateInfluencerReviewPayload) {
    const { user, influencer } = data;

    const existingInfluencer = await this.influencerService.getInfluencer(user);

    if (existingInfluencer) {
      const { _id: influencerId } = existingInfluencer;

      if (influencer == (influencerId as ObjectId).toString()) {
        throw new ApiError(
          HTTP.BAD_REQUEST,
          "Vous ne pouvez pas vous évaluer vous-même"
        );
      }
    }

    return await this.repository.createInfluencerReview(data);
  }

  async getReviews(query: GetInfluencerReviewsInput["query"]) {
    return await this.repository.getInfluencerReviews(query);
  }
}
