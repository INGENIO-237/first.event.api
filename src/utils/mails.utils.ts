import config from "../config";

export function constructOtpMessage({ code }: { code: number }) {
  return `Hello,\nVotre code de vérification ${config.MAIL_SENDER} est: ${code}`;
}

export enum MAIL_OBJECTS {
  OTP = "ACCOUNT VERIFICATION",
}
