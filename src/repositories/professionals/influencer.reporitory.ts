import { Service } from "typedi";
import {
  RegisterInfluencer,
  UpdateInfluencer,
} from "../../schemas/professionals/influencer.schemas";
import Influencer from "../../models/professionals/influencer.model";
import { Types } from "mongoose";

@Service()
export default class InfluencerRepo {
  async registerInfluencer(
    userId: string,
    payload: RegisterInfluencer["body"]
  ) {
    return await Influencer.create({ user: userId, ...payload });
  }

  async getInfluencer(userId: string) {
    return await Influencer.findById(userId);
  }

  async updateInfluencer(userId: string, update: UpdateInfluencer["body"]) {
    await Influencer.findOneAndUpdate(
      { user: new Types.ObjectId(userId) },
      { ...update }
    );
  }
}
