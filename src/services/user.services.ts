import { Service } from "typedi";
import { RegisterUser, UpdateGeneralInfo } from "../schemas/user.schemas";
import UserRepo from "../repositories/user.repository";
import ApiError from "../utils/errors/errors.base";
import HTTP from "../utils/constants/http.responses";

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
  }: {
    userId?: string;
    email?: string;
    otp?: number;
    isVerified?: boolean;
    password?: string;
  }) {
    if (!email && !userId) {
      throw new ApiError(
        HTTP.INTERNAL_SERVER_ERROR,
        "Must pass either email or user id to update the user"
      );
    }

    await this.repository.updateUser({
      userId,
      otp,
      isVerified,
      password,
      email,
    });
  }

  async updateGeneralInfo(userId: string, update: UpdateGeneralInfo) {
    console.log({ update });

    await this.repository.updateGeneralInfo(userId, update);
  }
}
