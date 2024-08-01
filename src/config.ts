const config = {
  PORT: process.env.PORT || 5000,
  SALT: Number(process.env.SALT),
  DB_URI: process.env.DB_URI as string,

  // MAIL
  MAIL_HOST: process.env.MAIL_HOST,
  MAIL_PORT: process.env.MAIL_PORT ? process.env.MAIL_PORT : 465,
  MAIL_USER: process.env.MAIL_USER,
  MAIL_PWD: process.env.MAIL_PWD,
  MAIL_SENDER: process.env.MAIL_SENDER,

  // TWILIO
  TWILIO_SID: process.env.TWILIO_SID as string,
  TWILIO_AUTH_TOKEN: process.env.TWILIO_AUTH_TOKEN as string,
  TWILIO_PHONE_NUMBER: process.env.TWILIO_PHONE_NUMBER as string,


  // Tokens
  ACCESS_TTL: process.env.ACCESS_TTL as string,
  REFRESH_TTL: process.env.REFRESH_TTL as string,
  PRIVATE_ACCESS_TOKEN: process.env.PRIVATE_ACCESS_TOKEN as string,
  PUBLIC_ACCESS_TOKEN: process.env.PUBLIC_ACCESS_TOKEN as string,
  PRIVATE_REFRESH_TOKEN: process.env.PRIVATE_REFRESH_TOKEN as string,
  PUBLIC_REFRESH_TOKEN: process.env.PUBLIC_REFRESH_TOKEN as string,
};

export default config;
