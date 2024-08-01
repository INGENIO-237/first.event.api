import { Service } from "typedi";
import User from "../models/user.model";
import { RegisterUser } from "../schemas/user.schemas";
import { Types } from "mongoose";

@Service()
export default class UserRepo {
  async registerUser(payload: RegisterUser["body"]) {
    return User.create(payload).then(async (document) => {
      return await User.findById(document._id as string).select("-password");
    });
  }

  async getUser({ userId, email }: { userId?: string; email?: string }) {
    return await User.findOne({
      $or: [{ _id: new Types.ObjectId(userId) }, { email }],
    });
  }
}
