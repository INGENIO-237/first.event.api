import { Service } from "typedi";
import User from "../models/user.model";
import { RegisterUser } from "../schemas/user.schemas";

@Service()
export default class UserRepo {
  async registerUser(payload: RegisterUser["body"]) {
    return User.create(payload).then(async (document) => {
      return await User.findById(document._id as string).select("-password");
    });
  }
}
