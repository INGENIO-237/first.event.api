import express from "express";
import router from "../router";
import connectToDb from "./db";

export default function createServer() {
  const server = express();

  (async () => await connectToDb())();

  // Router
  router(server);

  return server;
}
