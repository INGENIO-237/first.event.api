import { Service } from "typedi";
import config from "../../config";
import twilio, { Twilio } from "twilio";
import { SmsInput } from "../../utils/constants/user.utils";

@Service()
export default class TwilioService {
  private _sid: string = config.TWILIO_SID;
  private _authToken: string = config.TWILIO_AUTH_TOKEN;
  private _phoneNumber: string = config.TWILIO_PHONE_NUMBER;

  private _twilioClient: Twilio;

  constructor() {
    this._twilioClient = twilio(this._sid, this._authToken);
  }

  async sendSms({ recipient, message }: SmsInput) {
    await this._twilioClient.messages.create({
      from: this._phoneNumber,
      to: recipient,
      body: message,
    });
  }
}