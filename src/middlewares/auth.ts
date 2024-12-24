import "reflect-metadata";

import { NextFunction, Request, Response } from "express";
import { JwtPayload } from "jsonwebtoken";
import Container from "typedi";
import JwtServices from "../services/utils/jwt.services";
import HTTP from "../utils/constants/http.responses";

function processDecodedPayload(
  req: Request,
  decoded: JwtPayload,
  next: NextFunction
) {
  const { user, isAdmin } = decoded;

  (req as any).user = {
    id: user,
    isAdmin: isAdmin ? isAdmin : false,
  };

  return next();
}

export function isLoggedIn(req: Request, res: Response, next: NextFunction) {
  // Retrieve access token
  const authHeader = req.headers.authorization ?? undefined;

  if (!authHeader && !authHeader?.startsWith("Bearer")) {
    return res.sendStatus(HTTP.UNAUTHORIZED);
  }

  const token = authHeader.split(" ")[1];

  const jwt = Container.get(JwtServices);

  const { decoded, expired } = jwt.verifyJwt(token);

  if (decoded && !expired) {
    return processDecodedPayload(req, decoded as JwtPayload, next);
  }

  if (expired) {
    const refreshToken = req.headers["x-refresh"];

    if (!refreshToken) return res.sendStatus(HTTP.UNAUTHORIZED);

    const { decoded, expired } = jwt.verifyJwt(refreshToken as string, true);

    if (expired) return res.sendStatus(HTTP.UNAUTHORIZED);

    const { user, isAdmin } = decoded as JwtPayload;

    const newAccessToken = jwt.reIssueAccesstoken({ user, isAdmin });

    if(!res.headersSent) res.setHeader("x-access-token", newAccessToken);

    return processDecodedPayload(req, decoded as JwtPayload, next);
  }
}

export function isAdmin(req: Request, res: Response, next: NextFunction) {
  if (!(req as any).user.isAdmin) return res.sendStatus(HTTP.FORBIDDEN);

  return next();
}
