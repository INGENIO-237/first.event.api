import { Service } from "typedi";
import {
  RegisterUser,
  UpdateAddresses,
  UpdateCredentials,
  UpdateGeneralInfo,
  UpdateInterests,
} from "../schemas/user.schemas";
import UserRepo from "../repositories/user.repository";
import ApiError from "../utils/errors/errors.base";
import HTTP from "../utils/constants/http.responses";
import { IUser } from "../models/user.model";
import { PROFILE } from "../utils/constants/user.utils";

@Service()
export default class UserServices {
  constructor(private repository: UserRepo) {}

  async registerUser(payload: RegisterUser["body"]) {
    const existingUser = await this.getUser({
      email: payload.email,
      raiseException: false,
    });

    if (existingUser) {
      throw new ApiError(
        HTTP.BAD_REQUEST,
        "Adresse électronique déjà utilisée"
      );
    }

    return await this.repository.registerUser(payload);
  }

  async getUsers() {
    return await this.repository.getUsers();
  }

  async getUser({
    userId,
    email,
    raiseException = true,
  }: {
    userId?: string;
    email?: string;
    raiseException?: boolean;
  }) {
    const user = await this.repository.getUser({ userId, email });

    if (!user && raiseException) {
      throw new ApiError(HTTP.BAD_REQUEST, "Utilisateur introuvable.");
    }

    return user;
  }

  async updateUser({
    userId,
    email,
    otp,
    isVerified,
    password,
    profile,
    professional,
  }: {
    userId?: string;
    email?: string;
    otp?: number;
    isVerified?: boolean;
    password?: string;
    profile?: string;
    professional?: PROFILE;
  }) {
    if (!email && !userId) {
      throw new ApiError(
        HTTP.INTERNAL_SERVER_ERROR,
        "Must pass either email or user id to update the user"
      );
    }

    if ((professional && !profile) || (profile && !professional)) {
      throw new ApiError(
        HTTP.INTERNAL_SERVER_ERROR,
        "Must pass either profile and professional to update the user"
      );
    }

    await this.repository.updateUser({
      userId,
      otp,
      isVerified,
      password,
      email,
      professional,
      profile,
    });
  }

  async updateGeneralInfo(userId: string, update: UpdateGeneralInfo) {
    const user = (await this.getUser({ userId })) as IUser;

    await this.repository.updateGeneralInfo(user._id as string, update);
  }

  async updateCredentials(userId: string, update: UpdateCredentials["body"]) {
    const user = (await this.getUser({ userId })) as IUser;

    if (!(await user.comparePassword(update.oldPassword))) {
      throw new ApiError(HTTP.BAD_REQUEST, "Ancien mot de passe incorrect");
    }

    const existingUser = (await this.getUser({ email: update.email })) as IUser;

    if (existingUser && existingUser._id != userId) {
      throw new ApiError(
        HTTP.BAD_REQUEST,
        "Adresse électronique déjà utilisée"
      );
    }

    await this.repository.updateCredentials(user._id as string, update);
  }

  async updateInterests(userId: string, update: UpdateInterests["body"]) {
    const user = (await this.getUser({ userId })) as IUser;

    await this.repository.updateInterests(user._id as string, update);
  }

  async updateAddresses(userId: string, update: UpdateAddresses["body"]) {
    const user = (await this.getUser({ userId })) as IUser;

    await this.repository.updateAddresses(user._id as string, update);
  }
}
