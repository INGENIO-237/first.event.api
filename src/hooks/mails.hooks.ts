import { MAIL_OBJECTS } from "../utils/mails.utils";
import MailServices from "../services/utils/mail.services";
import { Service } from "typedi";
import EventEmitter from "node:events";

@Service()
export default class MailsHooks {
  constructor(private service: MailServices) {}

  registerListeners(emitter: EventEmitter) {
    emitter.on(
      MAIL_OBJECTS.OTP,
      async ({ recipient, otp }: { recipient: string; otp: number }) => {
        await this.service.sendOtpMail(recipient, otp);
      }
    );
  }
}
