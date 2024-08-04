import { NextFunction, Request, Response } from "express";

export function tryCatch(handler: Function) {
  return async function (req: Request, res: Response, next: NextFunction) {
    try {
      await handler(req, res);
    } catch (error) {
      next(error);
    }
  };
}

export type ValidationError = {
  errors: [{ message: string }];
};

export function parseValidationError(validationError: ValidationError) {
  const errors = [...validationError.errors];

  return errors.map((error) => {
    return { message: error.message };
  });
}
