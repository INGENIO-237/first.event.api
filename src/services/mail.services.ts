import mailer, { Transporter } from "nodemailer";
import { Service } from "typedi";
import config from "../config";
import { MailOpts } from "../utils/constants/user.utils";
import { constructOtpMessage, MAIL_OBJECTS } from "../utils/mails.utils";
import SMTPTransport from "nodemailer/lib/smtp-transport";

@Service()
export default class MailServices {
  private _host: string;
  private _user: string;
  private _pwd: string;
  private _port: number;
  private _sender: string;
  private _transport: Transporter<SMTPTransport.SentMessageInfo>;

  constructor() {
    const { MAIL_HOST, MAIL_PORT, MAIL_PWD, MAIL_SENDER, MAIL_USER } = config;

    this._host = MAIL_HOST;
    this._user = MAIL_USER;
    this._pwd = MAIL_PWD;
    this._port = MAIL_PORT as number;
    this._sender = MAIL_SENDER;

    this._transport = this.initTransporter();
  }

  private initTransporter() {
    return mailer.createTransport({
      host: this._host,
      port: this._port,
      secure: true,
      auth: {
        user: this._user,
        pass: this._pwd,
      },
    });
  }

  private async sendMail(recipient: string, { message, object }: MailOpts) {
    await this._transport
      .sendMail({
        from: `"${this._sender}" <${this._user}>`,
        to: recipient,
        subject: object,
        text: message,
      })
      .then((response) => console.log({ mail: response }));
  }

  async sendOtpMail(recipient: string, otp: number) {
    const content = constructOtpMessage({ code: otp });
    await this.sendMail(recipient, {
      message: content,
      object: MAIL_OBJECTS.OTP,
    });
  }
}
