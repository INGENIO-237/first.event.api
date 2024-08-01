import { Service } from "typedi";
import { RegisterUser } from "../schemas/user.schemas";
import UserRepo from "../repositories/user.repository";

@Service()
export default class UserServices {
  constructor(private repository: UserRepo) {}

  async registerUser(payload: RegisterUser["body"]) {
    return await this.repository.registerUser(payload);
  }
}
