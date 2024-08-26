import { Service } from "typedi";
import {
  RegisterOrganizer,
  UpdateOrganizer,
} from "../../schemas/professionals/organizer.schemas";
import Organizer from "../../models/professionals/organizer.model";
import { Types } from "mongoose";

@Service()
export default class OrganizerRepo {
  async registerOrganizer(userId: string, payload: RegisterOrganizer["body"]) {
    return await Organizer.create({ user: userId, ...payload });
  }

  async updateOrganizer(
    userId: string,
    update: UpdateOrganizer["body"] & { subscription?: string }
  ) {
    await Organizer.findOneAndUpdate(
      { user: new Types.ObjectId(userId) },
      { ...update }
    );
  }
}
