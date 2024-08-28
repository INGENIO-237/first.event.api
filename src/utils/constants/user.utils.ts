export enum PROFILE {
  INFLUENCER = "Influencer",
  ORGANIZER = "Organizer",
}

export type Phone = {
  home?: string;
  mobile?: string;
};

export type MailOpts = {
  message: string;
  object: string;
};

export type SmsInput = { recipient: string; message: string };

// export enum ADDRESS_TYPE {
//   BILLING = "BILLING",
//   SHIPPING = "SHIPPING",
//   PROFESSIONAL = "PROFESSIONAL",
// }

export enum OAUTH_PROVIDER {
  GOOGLE = "GOOGLE",
  FACEBOOK = "FACEBOOK",
  APPLE = "APPLE",
}
