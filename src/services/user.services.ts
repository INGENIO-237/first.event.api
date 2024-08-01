import { Service } from "typedi";
import { RegisterUser } from "../schemas/user.schemas";
import UserRepo from "../repositories/user.repository";
import ApiError from "../utils/errors/errors.base";
import HTTP from "../utils/constants/http.responses";

@Service()
export default class UserServices {
  constructor(private repository: UserRepo) {}

  async registerUser(payload: RegisterUser["body"]) {
    return await this.repository.registerUser(payload);
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
      throw new ApiError(HTTP.BAD_REQUEST, "Utilisateur introuvable.")
    }

    return user;
  }
}
