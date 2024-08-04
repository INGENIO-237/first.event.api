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

  // TODO: Include hasBeenDeleted and updatedAt properties when users are fetched by top-1 tier admin
  async getUsers() {
    return await User.find().select("-password -hasBeenDeleted -updatedAt -__v");
  }

  async getUser({ userId, email }: { userId?: string; email?: string }) {
    return await User.findOne({
      $or: [{ _id: new Types.ObjectId(userId) }, { email }],
    });
  }

  async updateUser({ userId, otp }: { userId: string; otp?: number }) {
    await User.findOneAndUpdate({ _id: new Types.ObjectId(userId) }, { otp });
  }
}
