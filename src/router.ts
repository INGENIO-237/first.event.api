import { Express, Request, Response } from "express";
import HTTP from "./utils/constants/http.responses";

export default function router(server: Express) {
  server.get("/healthcheck", (req: Request, res: Response) =>
    res.status(HTTP.OK).json({ message: "Server's running just fine.🚀" })
  );
}
