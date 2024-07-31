import mongoose from "mongoose";
import config from "../config";
import logger from "../utils/logger";

const TIMEOUT = 5000; // 5s in ms
const MAX_RETRIES = 5;

export default async function connectToDb() {
  let tries = 0;

  mongoose
    .connect(config.DB_URI)
    .then(() => {
      logger.info("Connected to DB");
    })
    .catch((error) => {
      tries += 1;

      logger.error("Failed to connect to DB: ", error);

      if (tries > MAX_RETRIES) {
        process.exit(1);
      } else {
        setTimeout(async () => {
          logger.error("Retrying...", tries / MAX_RETRIES);
          await connectToDb();
        }, TIMEOUT);
      }
    });
}
