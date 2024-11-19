import { Types } from "mongoose";
import { Service } from "typedi";
import Organizer from "../../models/professionals/organizer.model";
import {
  RegisterOrganizer,
  UpdateOrganizerPayload,
} from "../../schemas/professionals/organizer.schemas";

@Service()
export default class OrganizerRepo {
  async registerOrganizer(userId: string, payload: RegisterOrganizer["body"]) {
    return await Organizer.create({ user: userId, ...payload });
  }

  async getOrganizer(userId: string) {
    return await Organizer.findOne({
      user: new Types.ObjectId(userId),
    }).populate("subscription user");
  }

  async getOrganizerById(id: string) {
    return await Organizer.findById(id).populate("user");
  }

  async getOrganizerByCAccountId(connectedAccount: string) {
    return await Organizer.findOne({ connectedAccount });
  }

  async updateOrganizer(userId: string, update: UpdateOrganizerPayload) {
    await Organizer.findOneAndUpdate(
      { user: new Types.ObjectId(userId) },
      { ...update },
      {
        new: true,
      }
    );
  }
}
