import { NextFunction, Request, Response } from "express";
import { AnyZodObject } from "zod";
import HTTP from "../utils/constants/http.responses";
import {
  parseValidationError,
  ValidationError,
} from "../utils/errors/errors.utlis";

export default function validate(schema: AnyZodObject) {
  return function (req: Request, res: Response, next: NextFunction) {
    try {
      schema.parse({
        body: req.body,
        params: req.params,
        query: req.query,
      });

      next();
    } catch (error) {
      return res
        .status(HTTP.BAD_REQUEST)
        .json(parseValidationError(error as ValidationError));
    }
  };
}
