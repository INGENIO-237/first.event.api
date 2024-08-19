import { Service } from "typedi";
import { Phone, PHONE_TYPE } from "../utils/constants/user.utils";
import SmsService from "./utils/sms.services";
import MailsHooks from "../hooks/mails.hooks";
import { MAIL_OBJECTS } from "../utils/mails.utils";

@Service()
export default class OtpServices {
  constructor(private sms: SmsService) {}

  generateOtp() {
    let code = Math.round(Math.random() * 1e5);

    return Number(code.toString().length < 5 ? code.toString() + "0" : code);
  }

  async sendOtp({
    email,
    phones,
    code,
  }: {
    email?: string;
    phones?: Phone[];
    code: number;
  }) {
    await this.sendOtpEmail(email as string, code);

    phones?.forEach(async (phone) => {
      if (phone.cat === PHONE_TYPE.MOBILE)
        await this.sendOtpPhone(String(phone), code);
    });
  }

  private async sendOtpPhone(phone: string, code: number) {
    await this.sms.sendOtpSms(phone, code);
  }

  private async sendOtpEmail(email: string, code: number) {
    MailsHooks.emit(MAIL_OBJECTS.OTP, { recipient: email, otp: code });
  }
}
