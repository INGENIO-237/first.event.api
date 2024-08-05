import { Service } from "typedi";
import AuthServices from "../services/auth.services";
import { Request, Response } from "express";
import { LoginPayload, ResendOtp } from "../schemas/auth.schemas";
import HTTP from "../utils/constants/http.responses";

@Service()
export default class AuthController {
  constructor(private service: AuthServices) {}

  async login(req: Request<{}, {}, LoginPayload["body"]>, res: Response) {
    const { accessToken, refreshToken, otpGenerated } =
      await this.service.login(req.body);

    return res
      .status(HTTP.CREATED)
      .json({ accessToken, refreshToken, otpGenerated });
  }
  
  async resendOtp(req: Request<{}, {}, ResendOtp["body"]>, res: Response) {
    await this.service.resendOtp(req.body);

    return res.sendStatus(HTTP.CREATED);
  }
}
