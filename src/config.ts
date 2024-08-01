const config = {
  PORT: process.env.PORT || 5000,
  SALT: Number(process.env.SALT),
  DB_URI: process.env.DB_URI as string
};

export default config;
