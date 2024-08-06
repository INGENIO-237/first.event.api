import { Service } from "typedi";
import JwtServices from "./jwt.services";
import { LoginPayload, ResetPwd, VerifAccount } from "../schemas/auth.schemas";
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
      await this.verifAccount({ email });

      otpGenerated = true;
    } else {
      await this.validateOtp({ email, otp: otp as number });

      // TODO: Add isAdmin property here
      accessToken = this.jwt.signJwt({ user: user._id });
      refreshToken = this.jwt.signJwt({ user: user._id }, true);
    }

    return { accessToken, refreshToken, otpGenerated };
  }

  private async sendOtp({ email }: { email: string }) {
    const user = (await this.userService.getUser({ email })) as IUser;

    const { phones } = user;
    const code = this.otp.generateOtp();

    await this.otp.sendOtp({ email, phones: phones as Phone[], code });

    await this.userService.updateUser({
      userId: user?._id as string,
      otp: code,
    });
  }

  private async isValidOtp({ email, otp }: { email: string; otp: number }) {
    const user = (await this.userService.getUser({ email })) as IUser;

    if (otp && user.otpExpiry) {
      const otpExpired = new Date().getTime() > user.otpExpiry.getTime();

      if (otpExpired) {
        throw new ApiError(
          HTTP.BAD_REQUEST,
          "Le code OTP a expiré. Demandez-en un autre."
        );
      }
    }
    
    return otp === (user.otp as number);
  }

  private async validateOtp({ email, otp }: { email: string; otp: number }) {
    const isValid = await this.isValidOtp({ email, otp });

    if (!isValid) {
      throw new ApiError(HTTP.BAD_REQUEST, "Le code OTP est incorrecte");
    } else {
      await this.userService.updateUser({
        email,
        isVerified: true,
      });
    }
  }

  async verifAccount({ email }: VerifAccount["body"]) {
    await this.sendOtp({ email });
  }

  async forgotPwdRequest({ email }: VerifAccount["body"]) {
    await this.verifAccount({ email });
  }

  async resetPwd({ otp, password, email }: ResetPwd["body"]) {
    this.validateOtp({ email, otp }).then(
      async () => await this.userService.updateUser({ email, password })
    );
  }
}
