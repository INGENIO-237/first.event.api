import { EventEmitter } from "node:events";
import { MAIL_OBJECTS } from "../utils/mails.utils";
import MailServices from "../services/utils/mail.services";
import IHook from "./hook.interface";
import { Service } from "typedi";

@Service()
export default class MailsHooks implements IHook {
  private _eventEmitter: EventEmitter;

  constructor(private service: MailServices) {
    this._eventEmitter = new EventEmitter();
    this.register(this._eventEmitter);
  }

  getEmitter() {
    return this._eventEmitter;
  }

  emit(event: MAIL_OBJECTS, data: any) {
    this._eventEmitter.emit(event, data);
  }

  register(emitter: EventEmitter) {
    emitter.on(
      MAIL_OBJECTS.OTP,
      async ({ recipient, otp }: { recipient: string; otp: number }) => {
        await this.service.sendOtpMail(recipient, otp);
      }
    );
  }
}
