import Container, { Service } from "typedi";
import {
  RegisterOrganizer,
  UpdateOrganizer,
} from "../../schemas/professionals/organizer.schemas";
import UserServices from "../user.services";
import { PROFILE } from "../../utils/constants/user.utils";
import OrganizerRepo from "../../repositories/professionals/organizer.repository";
import ApiError from "../../utils/errors/errors.base";
import HTTP from "../../utils/constants/http.responses";
import { IOrganizer } from "../../models/professionals/organizer.model";
import { ISubscription } from "../../models/subs/subscription.model";
import { IUser } from "../../models/user.model";
import InfluencerServices from "./influencer.services";

@Service()
export default class OrganizerServices {
  constructor(
    private repository: OrganizerRepo,
    private userService: UserServices
  ) {}

  async registerOrganizer(userId: string, payload: RegisterOrganizer["body"]) {
    const influencerService = Container.get(InfluencerServices);

    // Make sure user has only one type profile of profile. Either Influencer or Organizer
    const influencer = await influencerService.getInfluencer(userId);

    if (influencer) {
      throw new ApiError(HTTP.BAD_REQUEST, "Vous êtes déjà influenceur");
    }

    // TODO: Make  sure user is not already an organizer

    const organizer = await this.repository.registerOrganizer(userId, payload);

    await this.userService.updateUser({
      userId,
      professional: PROFILE.ORGANIZER,
      profile: organizer._id as string,
    });

    return organizer;
  }

  async getOrganizer(userId: string, raiseException = false) {
    const organizer = await this.repository.getOrganizer(userId);

    if (!organizer && raiseException) {
      throw new ApiError(HTTP.NOT_FOUND, "Cet organisateur n'existe pas");
    }

    return organizer;
  }

  async updateOrganizer(
    userId: string,
    update: UpdateOrganizer["body"] & { subscription?: string }
  ) {
    await this.repository.updateOrganizer(userId, update);
  }

  async validateAbilityToSubscribe(userId: string) {
    const organizer = (await this.getOrganizer(userId)) as IOrganizer;

    // Ensure current user is legit and has an organizer profile
    if (!organizer) {
      throw new ApiError(HTTP.BAD_REQUEST, "Vous n'êtes pas un organisateur");
    }

    const { user } = organizer;

    const { isVerified } = user as IUser;

    if (!isVerified) {
      throw new ApiError(HTTP.BAD_REQUEST, "Compte non vérifié");
    }

    // Ensure that current user doesn't have an ongoing plan
    if (organizer.subscription) {
      const { endsOn, hasBeenCancelled } =
        organizer.subscription as ISubscription;

      if (!hasBeenCancelled) {
        const expiryTime = endsOn.getTime();
        const presentTime = new Date().getTime();

        if (expiryTime > presentTime) {
          throw new ApiError(
            HTTP.BAD_REQUEST,
            `Vous avez déjà une souscription en cours`
          );
        }
      }
    }
  }
}
