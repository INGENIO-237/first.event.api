import { Service } from "typedi";
import {
  RegisterOrganizer,
//   UpdateOrganizer,
} from "../../schemas/professionals/organizer.schemas";
import Organizer from "../../models/professionals/organizer.model";

@Service()
export default class OrganizerRepo {
  async registerOrganizer(
    userId: string,
    payload: RegisterOrganizer["body"]
  ) {
    return await Organizer.create({ user: userId, ...payload });
  }

//   async updateOrganizer(userId: string, update: UpdateOrganizer["body"]) {
//     await Organizer.findByIdAndUpdate(userId, { ...update });
//   }
}
