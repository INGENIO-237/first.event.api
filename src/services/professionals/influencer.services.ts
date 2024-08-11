import { Service } from "typedi";
import InfluencerRepo from "../../repositories/professionals/influencer.reporitory";
import { RegisterInfluencer } from "../../schemas/professionals/influencer.schemas";

@Service()
export default class InfluencerServices {
  constructor(private repository: InfluencerRepo) {}

  async registerInfluencer(
    userId: string,
    payload: RegisterInfluencer["body"]
  ) {
    return await this.repository.registerInfluencer(userId, payload);
  }
}
