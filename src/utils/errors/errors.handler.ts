import { NextFunction, Request, Response } from "express";
import logger from "../logger";
import { BaseError } from "./errors.base";
import HTTP from "../constants/http.responses";

export default function errorHandler(
  error: BaseError,
  req: Request,
  res: Response,
  next: NextFunction
) {
  logger.error(error);
  return error.isOperational
    ? res.status(error.statusCode).json([{ message: error.message }])
    : res
        .status(HTTP.INTERNAL_SERVER_ERROR)
        .json([
          {
            message:
              "Un problème s'est produit. Réessayez plus tard. Si le problème persiste, veuillez contacter le service d'assistance.",
          },
        ]);
}
