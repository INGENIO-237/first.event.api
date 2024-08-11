import { Service } from "typedi";
import { RegisterInfluencer } from "../../schemas/professionals/influencer.schemas";
import Influencer from "../../models/professionals/influencer.model";

@Service()
export default class InfluencerRepo {
  async registerInfluencer(
    userId: string,
    payload: RegisterInfluencer["body"]
  ) {
    return await Influencer.create({ user: userId, ...payload });
  }
}
