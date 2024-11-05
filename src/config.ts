import { ENV } from "./utils/constants/common";

const config = {
  PORT: process.env.PORT || 5000,
  SALT: Number(process.env.SALT),
  DB_URI: process.env.DB_URI as string,
  COUPON_LENGTH: (process.env.COUPON_LENGTH ?? 8) as number,
  PAYMENT_CONFIRMATION_TIMEOUT: (process.env.PAYMENT_CONFIRMATION_TIMEOUT ?? 7000) as number, // in ms

  // MAIL
  MAIL_HOST: process.env.MAIL_HOST as string,
  MAIL_PORT: process.env.MAIL_PORT ?? (465 as number),
  MAIL_USER: process.env.MAIL_USER as string,
  MAIL_PWD: process.env.MAIL_PWD as string,
  MAIL_SENDER: process.env.MAIL_SENDER as string,

  // TWILIO
  TWILIO_SID: process.env.TWILIO_SID as string,
  TWILIO_AUTH_TOKEN: process.env.TWILIO_AUTH_TOKEN as string,
  TWILIO_PHONE_NUMBER: process.env.TWILIO_PHONE_NUMBER as string,

  // CLOUDINARY
  CLOUDINARY_NAME: (process.env.NODE_ENV == ENV.PROD
    ? process.env.CLOUDINARY_NAME_LIVE
    : process.env.CLOUDINARY_NAME_TEST) as string,
  CLOUDINARY_API_KEY: (process.env.NODE_ENV == ENV.PROD
    ? process.env.CLOUDINARY_API_KEY_LIVE
    : process.env.CLOUDINARY_API_KEY_TEST) as string,
  CLOUDINARY_SECRET_KEY: (process.env.NODE_ENV == ENV.PROD
    ? process.env.CLOUDINARY_SECRET_KEY_LIVE
    : process.env.CLOUDINARY_SECRET_KEY_TEST) as string,

  STRIPE_PUBLIC_KEY:
    process.env.NODE_ENV == ENV.PROD
      ? (process.env.STRIPE_PUBLIC_KEY_LIVE as string)
      : (process.env.STRIPE_PUBLIC_KEY_TEST as string),
  STRIPE_SECRET_KEY:
    process.env.NODE_ENV == ENV.PROD
      ? (process.env.STRIPE_SECRET_KEY_LIVE as string)
      : (process.env.STRIPE_SECRET_KEY_TEST as string),
  STRIPE_API_VERSION: process.env.STRIPE_API_VERSION as string,
  STRIPE_WEBHOOK_ENDPOINT_SECRET: (process.env.NODE_ENV == ENV.PROD
    ? process.env.STRIPE_WEBHOOK_ENDPOINT_SECRET_LIVE
    : process.env.STRIPE_WEBHOOK_ENDPOINT_SECRET_TEST) as string,

  // TOKENS
  ACCESS_TTL: process.env.ACCESS_TTL as string,
  REFRESH_TTL: process.env.REFRESH_TTL as string,
  PRIVATE_ACCESS_TOKEN: process.env.PRIVATE_ACCESS_TOKEN as string,
  PUBLIC_ACCESS_TOKEN: process.env.PUBLIC_ACCESS_TOKEN as string,
  PRIVATE_REFRESH_TOKEN: process.env.PRIVATE_REFRESH_TOKEN as string,
  PUBLIC_REFRESH_TOKEN: process.env.PUBLIC_REFRESH_TOKEN as string,
};

export default config;
