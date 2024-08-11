import "reflect-metadata";

import EventEmitter from "node:events";
import { MAIL_OBJECTS } from "../utils/mails.utils";
import Container from "typedi";
import MailServices from "../services/utils/mail.services";

const service = Container.get(MailServices);

const MailsHooks = new EventEmitter();

MailsHooks.on(
  MAIL_OBJECTS.OTP,
  async ({ recipient, otp }: { recipient: string; otp: number }) => {
    await service.sendOtpMail(recipient, otp);
  }
);

export default MailsHooks;
