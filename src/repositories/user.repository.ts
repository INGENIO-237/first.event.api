import { Service } from "typedi";
import User from "../models/user.model";
import {
  RegisterUser,
  UpdateCredentials,
  UpdateGeneralInfo,
  UpdateInterests,
} from "../schemas/user.schemas";
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
    return await User.find().select(
      "-password -hasBeenDeleted -updatedAt -__v"
    );
  }

  async getUser({ userId, email }: { userId?: string; email?: string }) {
    return await User.findOne({
      $or: [{ _id: new Types.ObjectId(userId) }, { email }],
    });
  }

  async updateUser({
    userId,
    email,
    otp,
    isVerified,
    password,
  }: {
    userId?: string;
    email?: string;
    otp?: number;
    isVerified?: boolean;
    password?: string;
  }) {
    if (userId) {
      await User.findOneAndUpdate(
        { _id: new Types.ObjectId(userId) },
        { otp, isVerified, password, email }
      );
    }

    if (!userId && email) {
      await User.findOneAndUpdate({ email }, { otp, isVerified, password });
    }
  }

  // TODO: Avoid having multiple phones of the same category
  async updateGeneralInfo(userId: string, update: UpdateGeneralInfo) {
    await User.findByIdAndUpdate(userId, { ...update });
  }

  async updateCredentials(userId: string, update: UpdateCredentials["body"]) {
    await User.findByIdAndUpdate(userId, { ...update });
  }

  async updateInterests(userId: string, update: UpdateInterests["body"]) {
    await User.findByIdAndUpdate(userId, { ...update });
  }
}
