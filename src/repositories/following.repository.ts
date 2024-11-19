import { Service } from "typedi";
import {
  CreateFollowingPayload,
  GetFollowings,
} from "../schemas/following.schemas";
import Following from "../models/following.model";
import { Types } from "mongoose";

@Service()
export default class FollowingRepo {
  async create(payload: CreateFollowingPayload) {
    return await Following.create(payload);
  }

  async findAll({ user, organizer }: GetFollowings["query"]) {
    return user && organizer
      ? await Following.find({
          user: new Types.ObjectId(user),
          organizer: new Types.ObjectId(organizer),
        })
      : user && !organizer
      ? await Following.find({ user: new Types.ObjectId(user) })
      : !user && organizer
      ? await Following.find({ organizer: new Types.ObjectId(organizer) })
      : await Following.find();
  }

  async findOne(id: string) {
    return await Following.findById(id);
  }

  async delete(id: string) {
    return await Following.findByIdAndDelete(id);
  }
}
