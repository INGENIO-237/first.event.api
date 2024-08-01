import express from "express";
import router from "../router";
import connectToDb from "./db";
import parseRequestBody from "../middlewares/parse.body";

export default function createServer() {
  const server = express();

  (async () => await connectToDb())();

  // Request body parser
  server.use(parseRequestBody());
  
  // Router
  router(server);

  return server;
}
