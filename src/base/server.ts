import express from "express";
import router from "../router";
import connectToDb from "./db";
import parseRequestBody from "../middlewares/parse.request.body";
import errorHandler from "../utils/errors/errors.handler";
import { v2 as cloudinary } from "cloudinary";
import config from "../config";
import registerEvents from "../hooks/event-bus-connector";
import cors from "cors";

export default function createServer() {
  const server = express();

  (async () => await connectToDb())();

  // Cors
  server.use(
    cors({
      origin: "*",
    })
  );

  // Request body parser
  server.use(parseRequestBody());

  // Cloudinary
  cloudinary.config({
    cloud_name: config.CLOUDINARY_NAME,
    api_key: config.CLOUDINARY_API_KEY,
    api_secret: config.CLOUDINARY_SECRET_KEY,
  });

  // Event bus connector
  registerEvents();

  // Router
  router(server);

  // Error handler
  server.use(errorHandler);

  return server;
}
