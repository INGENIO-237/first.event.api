import { Phone, PHONE_TYPE } from "../utils/constants/user.utils";
import SmsService from "./sms.services";

export default class OtpServices {
  constructor(private sms: SmsService) {}

  private generateOtp() {
    let code = Math.round(Math.random() * 1e6);

    return Number(code.toString().length < 6 ? code.toString() + "0" : code);
  }

  async sendOtp({ email, phones }: { email?: string; phones?: Phone[] }) {
    const code = this.generateOtp();

    await this.sendOtpEmail(email as string, code);

    phones?.forEach(async (phone) => {
      if (phone.cat === PHONE_TYPE.MOBILE)
        await this.sendOtpPhone(String(phone), code);
    });
  }

  private async sendOtpPhone(phone: string, code: number) {
    await this.sms.sendOtpSms(phone, code)
  }

  // TODO: Implement otp sending via mail
  private async sendOtpEmail(email: string, code: number) {}
}
