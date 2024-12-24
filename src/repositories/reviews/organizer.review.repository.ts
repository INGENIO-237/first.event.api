import { Types } from "mongoose";
import { Service } from "typedi";
import OrganizerReview from "../../models/reviews/organizer.review.model";
import {
  CreateOrganizerReviewPayload,
  GetOrganizerReviewsInput,
} from "../../schemas/reviews/organizer.review.schemas";

@Service()
export default class OrganizerReviewRepo {
  async createOrganizerReview(payload: CreateOrganizerReviewPayload) {
    return await OrganizerReview.create(payload);
  }

  async getOrganizerReviews(query: GetOrganizerReviewsInput["query"]) {
    const { organizer } = query;

    return await OrganizerReview.find({
      organizer: new Types.ObjectId(organizer),
    });
  }
}
