export enum PROFILE {
  NORMAL = "NORMAL",
  MARKETER = "MARKETER",
  ORGANIZER = "ORGANIZER",
}

export type Phone = {
  cat: PHONE_TYPE;
  value: Number;
};

export type MailOpts = {
  message: string;
  object: string;
};

export type SmsInput = { recipient: string; message: string };

export enum PHONE_TYPE {
  HOME = "HOME",
  MOBILE = "MOBILE",
}

export enum ADDRESS_TYPE {
  BILLING = "BILLING",
  DELIVERY = "DELIVERY",
  PROFESSIONAL = "PROFESSIONAL",
}

export enum OAUTH_PROVIDER {
  GOOGLE = "GOOGLE",
  FACEBOOK = "FACEBOOK",
  APPLE = "APPLE",
}
