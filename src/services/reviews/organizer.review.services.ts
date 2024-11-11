import { Service } from "typedi";
import OrganizerReviewRepo from "../../repositories/reviews/organizer.review.repository";
import {
  CreateOrganizerReviewPayload,
  GetOrganizerReviewsInput,
} from "../../schemas/reviews/organizer.review.schemas";
import OrganizerServices from "../professionals/organizer.services";
import { ObjectId } from "mongoose";
import ApiError from "../../utils/errors/errors.base";
import HTTP from "../../utils/constants/http.responses";

@Service()
export default class OrganizerReviewServices {
  constructor(
    private readonly repository: OrganizerReviewRepo,
    private readonly organizerService: OrganizerServices
  ) {}

  async createReview(data: CreateOrganizerReviewPayload) {
    const { user, organizer } = data;

    const existingOrganizer = await this.organizerService.getOrganizer(
      user,
      false
    );

    if (existingOrganizer) {
      const { _id: orgUser } = existingOrganizer;

      if (organizer == (orgUser as ObjectId).toString()) {
        throw new ApiError(
          HTTP.BAD_REQUEST,
          "Vous ne pouvez pas vous évaluer vous-même"
        );
      }
    }

    return await this.repository.createOrganizerReview(data);
  }

  async getReviews(query: GetOrganizerReviewsInput["query"]) {
    return await this.repository.getOrganizerReviews(query);
  }
}
