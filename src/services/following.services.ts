import { Service } from "typedi";
import { IFollowing } from "../models/following.model";
import { IOrganizer } from "../models/professionals/organizer.model";
import { IUser } from "../models/user.model";
import FollowingRepo from "../repositories/following.repository";
import { CreateFollowing, GetFollowings } from "../schemas/following.schemas";
import { User } from "../utils/constants/common";
import HTTP from "../utils/constants/http.responses";
import ApiError from "../utils/errors/errors.base";
import OrganizerServices from "./professionals/organizer.services";

@Service()
export default class FollowingServices {
  constructor(
    private readonly followingRepository: FollowingRepo,
    private readonly organizerServices: OrganizerServices
  ) {}

  async createFollowing(payload: CreateFollowing["body"] & { user: User }) {
    const { user, organizer } = payload;

    const { user: orgUser } = (await this.organizerServices.getOrganizerById(
      organizer
    )) as IOrganizer;

    const { _id: orgUserId } = orgUser as IUser;

    if ((orgUserId as string) == user.id) {
      throw new ApiError(
        HTTP.BAD_REQUEST,
        "Vous ne pouvez pas vous suivre vous même"
      );
    }

    return await this.followingRepository.create({ ...payload, user: user.id });
  }

  async getFollowings({
    query,
    user,
  }: {
    query: GetFollowings["query"];
    user: User;
  }) {
    const { organizer, user: fUser } = query;

    if (!organizer && !fUser && !user.isAdmin) {
      throw new ApiError(
        HTTP.FORBIDDEN,
        "Vous n'êtes pas autorisé à accéder à cette ressource"
      );
    }

    if (organizer) {
      const existingOrganizer = await this.organizerServices.getOrganizer(
        user.id.toString(),
        false
      );

      if (!existingOrganizer && !user.isAdmin) {
        throw new ApiError(
          HTTP.FORBIDDEN,
          "Vous n'êtes pas autorisé à accéder à cette ressource"
        );
      }

      if (
        existingOrganizer &&
        (existingOrganizer._id as string) !== organizer &&
        !user.isAdmin
      ) {
        throw new ApiError(
          HTTP.FORBIDDEN,
          "Vous n'êtes pas autorisé à accéder à cette ressource"
        );
      }
    }

    return await this.followingRepository.findAll(query);
  }

  async getFollowingById(id: string, raiseException = true) {
    const following = await this.followingRepository.findOne(id);

    if (!following && raiseException) {
      throw new ApiError(HTTP.NOT_FOUND, "Connection non trouvée");
    }

    return following;
  }

  async deleteFollowing({ user, id }: { user: User; id: string }) {
    const { user: fUser } = (await this.getFollowingById(id)) as IFollowing;

    if (user.id !== fUser.id.toString() && !user.isAdmin) {
      throw new ApiError(
        HTTP.FORBIDDEN,
        "Vous n'êtes pas autorisé à supprimer cette connection"
      );
    }

    return await this.followingRepository.delete(id);
  }
}
