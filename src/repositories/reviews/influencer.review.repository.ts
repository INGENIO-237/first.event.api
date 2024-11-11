import { Types } from "mongoose";
import { Service } from "typedi";
import InfluencerReview from "../../models/reviews/influencer.review.model";
import {
  CreateInfluencerReviewPayload,
  GetInfluencerReviewsInput,
} from "../../schemas/reviews/influencer.review.schemas";

@Service()
export default class InfluencerReviewRepo {
  async createInfluencerReview(payload: CreateInfluencerReviewPayload) {
    return await InfluencerReview.create(payload);
  }

  async getInfluencerReviews(query: GetInfluencerReviewsInput["query"]) {
    const { influencer } = query;

    return await InfluencerReview.find({
      influencer: new Types.ObjectId(influencer),
    });
  }
}
