import createServer from "./base/server";
import config from "./config";
import logger from "./utils/logger";

const server = createServer();

// TODO: Change host based on NODE_ENV
server.listen(config.PORT, () =>
  logger.info(`Server running on http://localhost:${config.PORT}.`)
);
