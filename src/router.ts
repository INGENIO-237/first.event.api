import { Express, Request, Response } from "express";
import HTTP from "./utils/constants/http.responses";
import UserRouter from "./routes/user.routes";
import AuthRouter from "./routes/auth.routes";
import InfluencerRouter from "./routes/professional/influencer.routes";

export default function router(server: Express) {
  server.get("/healthcheck", (req: Request, res: Response) =>
    res.status(HTTP.OK).json({ message: "Server's running just fine.🚀" })
  );

  server.use("/accounts", UserRouter);
  server.use("/influencers", InfluencerRouter);
  server.use("/auth", AuthRouter);
}
