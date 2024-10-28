import { Service } from "typedi";
import SmsService from "./sms.services";
import { Phone } from "../../utils/constants/user.utils";
import EventBus from "../../hooks/event-bus";
import { MAIL_OBJECTS } from "../../utils/mails.utils";

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
    phones?: Phone;
    code: number;
  }) {
    await this.sendOtpEmail(email as string, code);
    if (phones?.mobile) await this.sendOtpPhone(phones.mobile, code);
  }

  private async sendOtpPhone(phone: string, code: number) {
    await this.sms.sendOtpSms(phone, code);
  }

  private async sendOtpEmail(email: string, code: number) {
    const emitter = EventBus.getEmitter();

    emitter.emit(MAIL_OBJECTS.OTP, { recipient: email, otp: code });
  }
}
