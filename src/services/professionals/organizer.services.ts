import { Service } from "typedi";
import {
  RegisterOrganizer,
  UpdateOrganizer,
} from "../../schemas/professionals/organizer.schemas";
import UserServices from "../user.services";
import { PROFILE } from "../../utils/constants/user.utils";
import OrganizerRepo from "../../repositories/professionals/organizer.repository";

@Service()
export default class OrganizerServices {
  constructor(
    private repository: OrganizerRepo,
    private userService: UserServices
  ) {}

  async registerOrganizer(
    userId: string,
    payload: RegisterOrganizer["body"]
  ) {
    // TODO: Make sure user has only one type profile of profile. Either Organizer or Organizer
    // Verify userId in organizer and organizerId in User
    const organizer = await this.repository.registerOrganizer(
      userId,
      payload
    );

    await this.userService.updateUser({
      userId,
      professional: PROFILE.ORGANIZER,
      profile: organizer._id as string,
    });

    return organizer;
  }

  async updateOrganizer(userId: string, update: UpdateOrganizer["body"]) {
    await this.repository.updateOrganizer(userId, update);
  }
}
