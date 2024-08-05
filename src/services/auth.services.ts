import { Service } from "typedi";
import JwtServices from "./jwt.services";
import { LoginPayload, ResendOtp } from "../schemas/auth.schemas";
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

  // TODO: Create a separate method for handling otp sending and storing user's otp 
  // TODO: Create a separate method for verifying user's account
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
      const code = this.otp.generateOtp();

      await this.otp.sendOtp({ email, phones: phones as Phone[], code });

      await this.userService.updateUser({
        userId: user?._id as string,
        otp: code,
      });

      otpGenerated = true;
    } else {
      if (otp && user.otpExpiry) {
        const otpExpired = new Date().getTime() > user.otpExpiry.getTime();

        if (otpExpired) {
          throw new ApiError(
            HTTP.BAD_REQUEST,
            "Le code OTP a expiré. Demandez-en un autre."
          );
        }

        if (otp !== user.otp) {
          throw new ApiError(HTTP.BAD_REQUEST, "Le code OTP est incorrecte");
        } else {
          await this.userService.updateUser({
            userId: user._id as string,
            isVerified: true,
          });
        }
      }

      accessToken = this.jwt.signJwt({ user: user._id });
      refreshToken = this.jwt.signJwt({ user: user._id }, true);
    }

    return { accessToken, refreshToken, otpGenerated };
  }

  async resendOtp({ email }: ResendOtp["body"]) {
    const user = (await this.userService.getUser({ email })) as IUser;

    const { phones } = user;
    const code = this.otp.generateOtp();

    await this.otp.sendOtp({ email, phones: phones as Phone[], code });

    await this.userService.updateUser({
      userId: user?._id as string,
      otp: code,
    });
  }
}
