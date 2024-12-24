import createServer from "./base/server";
import config from "./config";
import logger from "./utils/logger";

const server = createServer();

// registerJobs(); TODO: Replace node-cron wiith agenda

server.listen(config.PORT, () =>
  logger.info(`Server running on http://localhost:${config.PORT}.`)
);
