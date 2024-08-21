import { json, NextFunction, Request, Response } from "express";

export default function parseRequestBody() {
  return function (req: Request, res: Response, next: NextFunction) {
    if (req && !req.originalUrl.includes("webhook"))
      return json()(req, res, next);

    return next();
  };
}
