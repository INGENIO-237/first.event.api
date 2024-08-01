const config = {
  PORT: process.env.PORT || 5000,
  SALT: Number(process.env.SALT),
  DB_URI: process.env.DB_URI as string,

  // Tokens
  ACCESS_TTL: process.env.ACCESS_TTL as string,
  REFRESH_TTL: process.env.REFRESH_TTL as string,
  PRIVATE_ACCESS_TOKEN: process.env.PRIVATE_ACCESS_TOKEN as string,
  PUBLIC_ACCESS_TOKEN: process.env.PUBLIC_ACCESS_TOKEN as string,
  PRIVATE_REFRESH_TOKEN: process.env.PRIVATE_REFRESH_TOKEN as string,
  PUBLIC_REFRESH_TOKEN: process.env.PUBLIC_REFRESH_TOKEN as string,
};

export default config;
