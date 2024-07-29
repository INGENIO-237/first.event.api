import createServer from "./base/server";
import config from "./config";

const server = createServer();

// TODO: Change host based on NODE_ENV
// TODO: Change logger
server.listen(config.PORT, () =>
  console.log(`Server running on http://localhost:${config.PORT}. 🚀`)
);
