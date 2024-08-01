import express from "express";
import router from "../router";
import connectToDb from "./db";
import parseRequestBody from "../middlewares/parse.request.body";
import errorHandler from "../utils/errors/errors.handler";

export default function createServer() {
  const server = express();

  (async () => await connectToDb())();

  // Request body parser
  server.use(parseRequestBody());

  // Router
  router(server);

  // Error handler
  server.use(errorHandler);

  return server;
}
