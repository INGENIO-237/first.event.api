import express from "express";
import router from "../router";

export default function createServer() {
  const server = express();

  // Router
  router(server);

  return server;
}
