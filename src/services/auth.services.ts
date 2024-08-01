import { Service } from "typedi";
import JwtServices from "./jwt.services";
import { LoginPayload } from "../schemas/auth.schemas";
import UserServices from "./user.services";
import OtpServices from "./otp.services";
import { IUser } from "../models/user.model";
import { Phone } from "../utils/constants/user.utils";
import ApiError from "../utils/errors/errors.base";
import HTTP from "../utils/constants/http.responses";

@Service()
export default class AuthServices {
  constructor(
    private jwt: JwtServices,
    private userService: UserServices,
    private otp: OtpServices
  ) {}

  async login({ email, password, otp }: LoginPayload["body"]) {
    const user = (await this.userService.getUser({ email })) as IUser;

    if (!(await user.comparePassword(password))) {
      throw new ApiError(HTTP.BAD_REQUEST, "Mot de passe incorrect");
    }

    let otpGenerated = false;
    let accessToken = null;
    let refreshToken = null;

    if (!user.isVerified && !otp) {
      const { phones } = user;
      await this.otp.sendOtp({ email, phones: phones as Phone[] });

      otpGenerated = true;

      //   TODO: Update otp field
    }

    if (otp) {
    }
  }
}
