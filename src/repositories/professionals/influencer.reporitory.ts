import { Types } from "mongoose";
import { Service } from "typedi";
import Influencer from "../../models/professionals/influencer.model";
import {
  RegisterInfluencer,
  UpdateInfluencerPayload,
} from "../../schemas/professionals/influencer.schemas";

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

  async getInfluencerByCAccountId(connectedAccount: string) {
    return await Influencer.findOne({ connectedAccount });
  }

  async updateInfluencer(userId: string, update: UpdateInfluencerPayload) {
    await Influencer.findOneAndUpdate(
      { user: new Types.ObjectId(userId) },
      { ...update }
    );
  }
}
