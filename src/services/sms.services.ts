import { Service } from "typedi";
import TwilioService from "./twilio.services";
import ApiError from "../utils/errors/errors.base";
import HTTP from "../utils/constants/http.responses";
import isValidPhoneNumber from "../utils/phone";
import { SmsInput } from "../utils/constants/user.utils";

@Service()
export default class SmsService {
  constructor(private service: TwilioService) {}

  private async sendSms({ recipient, message }: SmsInput) {
    if (!isValidPhoneNumber(recipient)) {
      throw new ApiError(HTTP.BAD_REQUEST, "Numéro de portable invalide");
    }

    await this.service.sendSms({ recipient, message });
  }

  async sendOtpSms(phone: string, code: number) {
    await this.sendSms({
      recipient: phone,
      message: `Hello,\nVotre code de vérification First Event est: ${code}`,
    });
  }
}
