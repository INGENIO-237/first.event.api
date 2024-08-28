import { Service } from "typedi";
import InfluencerRepo from "../../repositories/professionals/influencer.reporitory";
import {
  RegisterInfluencer,
  UpdateInfluencer,
} from "../../schemas/professionals/influencer.schemas";
import UserServices from "../user.services";
import { PROFILE } from "../../utils/constants/user.utils";
import OrganizerServices from "./organizer.services";
import ApiError from "../../utils/errors/errors.base";
import HTTP from "../../utils/constants/http.responses";

@Service()
export default class InfluencerServices {
    constructor(
    private repository: InfluencerRepo,
    private userService: UserServices,
    private organizerService: OrganizerServices
  ) {}

  async registerInfluencer(
    userId: string,
    payload: RegisterInfluencer["body"]
  ) {
    // Make sure user has only one type profile of profile. Either Influencer or Organizer
    const organizer = await this.organizerService.getOrganizer(userId);

    if (organizer) {
      throw new ApiError(HTTP.BAD_REQUEST, "Vous êtes déjà organisateur");
    }

    const influencer = await this.repository.registerInfluencer(
      userId,
      payload
    );

    await this.userService.updateUser({
      userId,
      professional: PROFILE.INFLUENCER,
      profile: influencer._id as string,
    });

    return influencer;
  }

  async getInfluencer(userId: string, raiseException = false) {
    const influencer = await this.repository.getInfluencer(userId);

    if(!influencer && raiseException){
      throw new ApiError(HTTP.NOT_FOUND, "Influencer not found");
    }

    return influencer
  }

  async updateInfluencer(userId: string, update: UpdateInfluencer["body"]) {
    await this.repository.updateInfluencer(userId, update);
  }
}
