import { Service } from "typedi";
import { RegisterGain } from "../../schemas/coupons/gain.schemas";
import Gain from "../../models/coupons/gain.model";

@Service()
export default class GainRepo {
  async registerGain(gain: RegisterGain["body"]) {
    return await Gain.create(gain);
  }
}
