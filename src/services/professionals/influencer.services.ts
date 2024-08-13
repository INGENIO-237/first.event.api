import { Service } from "typedi";
import InfluencerRepo from "../../repositories/professionals/influencer.reporitory";
import { RegisterInfluencer } from "../../schemas/professionals/influencer.schemas";
import UserServices from "../user.services";
import { PROFILE } from "../../utils/constants/user.utils";

@Service()
export default class InfluencerServices {
  constructor(
    private repository: InfluencerRepo,
    private userService: UserServices
  ) {}

  async registerInfluencer(
    userId: string,
    payload: RegisterInfluencer["body"]
  ) {
    // TODO: Make sure user has only one type profile of profile. Either Influencer or Organizer
    // Verify userId in influencer and influencerId in User
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
}
