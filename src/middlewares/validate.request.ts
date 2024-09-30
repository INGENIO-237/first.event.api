import "reflect-metadata";

import { NextFunction, Request, Response } from "express";
import { AnyZodObject } from "zod";
import HTTP from "../utils/constants/http.responses";
import {
  parseValidationError,
  ValidationError,
} from "../utils/errors/errors.utlis";
import Container from "typedi";
import CloudinaryServices from "../services/utils/cloudinary.services";
import logger from "../utils/logger";

const cloudinary = Container.get(CloudinaryServices);

export default function validate(schema: AnyZodObject) {
  return async function (req: Request, res: Response, next: NextFunction) {
    try {
      schema.parse({
        body: req.body,
        params: req.params,
        query: req.query,
      });

      next();
    } catch (error) {
      try {
        if (req.file) {
          const file = req.file as Express.Multer.File;

          await cloudinary.deleteResource(req.body[file.fieldname]);
        } else if (req.files) {
          const keys = Object.keys(req.files);

          const files = req.files as {
            [fieldname: string]: Express.Multer.File[];
          };

          keys.forEach(async (key) => {
            const filesList = files[key];

            await Promise.all(
              filesList.map(async (file) => {
                await cloudinary.deleteResource(req.body[file.fieldname]);
              })
            );
          });
        }
      } catch (error) {
        logger.error(error);
      }

      return res
        .status(HTTP.BAD_REQUEST)
        .json(parseValidationError(error as ValidationError));
    }
  };
}
