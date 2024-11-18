import "reflect-metadata";

import EventEmitter from "node:events";
import Container, { Service } from "typedi";
import EventBus from "../../hooks/event-bus";
import { IUser } from "../../models/user.model";
import InfluencerRepo from "../../repositories/professionals/influencer.reporitory";
import {
  RegisterInfluencer,
  UpdateInfluencerPayload,
} from "../../schemas/professionals/influencer.schemas";
import HTTP from "../../utils/constants/http.responses";
import { PROFILE, USERS_ACTIONS } from "../../utils/constants/user.utils";
import ApiError from "../../utils/errors/errors.base";
import UserServices from "../user.services";
import OrganizerServices from "./organizer.services";

@Service()
export default class InfluencerServices {
  private emitter: EventEmitter;

  constructor(
    private repository: InfluencerRepo,
    private userService: UserServices
  ) {
    this.emitter = EventBus.getEmitter();
  }

  async registerInfluencer(
    userId: string,
    payload: RegisterInfluencer["body"]
  ) {
    const organizerService = Container.get(OrganizerServices);

    // Make sure user has only one type profile of profile. Either Influencer or Organizer
    const organizer = await organizerService.getOrganizer(userId);

    if (organizer) {
      throw new ApiError(HTTP.BAD_REQUEST, "Vous êtes déjà organisateur");
    }

    const { isAdmin } = (await this.userService.getUser({ userId })) as IUser;

    if (isAdmin) {
      throw new ApiError(
        HTTP.BAD_REQUEST,
        "Vous ne pouvez pas être influenceur si vous êtes administrateur"
      );
    }

    const existingInfluencer = await this.getInfluencer(userId);

    if (existingInfluencer) {
      throw new ApiError(HTTP.BAD_REQUEST, "Vous êtes déjà influencer");
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

    const { firstname, lastname, email } = (await this.userService.getUser({
      userId,
    })) as IUser;

    this.emitter.emit(USERS_ACTIONS.USER_PROFESSIONAL_PROFILE_CREATED, {
      email,
      name: firstname + " " + lastname,
    });

    return influencer;
  }

  async getInfluencer(userId: string, raiseException = false) {
    const influencer = await this.repository.getInfluencer(userId);

    if (!influencer && raiseException) {
      throw new ApiError(HTTP.NOT_FOUND, "Ce communicateur n'existe pas");
    }

    return influencer;
  }

  async getInfluencerByCAccountId(
    connectedAccount: string,
    raiseException = false
  ) {
    const influencer = await this.repository.getInfluencerByCAccountId(
      connectedAccount
    );

    if (!influencer && raiseException) {
      throw new ApiError(HTTP.NOT_FOUND, "Ce communicateur n'existe pas");
    }

    return influencer;
  }

  async updateInfluencer(userId: string, update: UpdateInfluencerPayload) {
    await this.repository.updateInfluencer(userId, update);
  }
}
