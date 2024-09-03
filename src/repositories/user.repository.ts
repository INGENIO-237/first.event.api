import { Service } from "typedi";
import User from "../models/user.model";
import {
  GeneralUserUpdatePayload,
  RegisterUser,
  UpdateAddresses,
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
    return await User.find()
      .populate("profile")
      .select(
        "-password -hasBeenDeleted -updatedAt -__v -profile.user -profile.type -profile.__v -profile.updateAt"
      );
  }

  async getUser({ userId, email }: { userId?: string; email?: string }) {
    return await User.findOne({
      $or: [{ _id: new Types.ObjectId(userId) }, { email }],
    }).populate("profile");
  }

  async updateUser({
    userId,
    email,
    otp,
    isVerified,
    password,
    profile,
    professional,
    stripeCustomer,
  }: GeneralUserUpdatePayload) {
    if (userId) {
      await User.findOneAndUpdate(
        { _id: new Types.ObjectId(userId) },
        {
          otp,
          isVerified,
          password,
          email,
          profile,
          professional,
          stripeCustomer,
        }
      );
    }

    if (!userId && email) {
      await User.findOneAndUpdate(
        { email },
        { otp, isVerified, password, profile, professional, stripeCustomer }
      );
    }
  }

  async updateGeneralInfo(userId: string, update: UpdateGeneralInfo) {
    await User.findByIdAndUpdate(userId, { ...update });
  }

  async updateCredentials(userId: string, update: UpdateCredentials["body"]) {
    await User.findByIdAndUpdate(userId, { ...update });
  }

  async updateInterests(userId: string, update: UpdateInterests["body"]) {
    await User.findByIdAndUpdate(userId, { ...update });
  }

  async updateAddresses(userId: string, update: UpdateAddresses["body"]) {
    await User.findByIdAndUpdate(userId, { ...update });
  }
}
