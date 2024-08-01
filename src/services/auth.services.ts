import { Service } from "typedi";
import JwtServices from "./jwt.services";
import { LoginPayload } from "../schemas/auth.schemas";
import UserServices from "./user.services";

@Service()
export default class AuthServices {
  constructor(private jwt: JwtServices, private userService: UserServices) {}

  async login({ email, password, otp }: LoginPayload["body"]) {
    const user = await this.userService.getUser({ email });

    
  }
}
