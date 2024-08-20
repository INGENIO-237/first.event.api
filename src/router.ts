import { Express, Request, Response } from "express";
import HTTP from "./utils/constants/http.responses";
import UserRouter from "./routes/user.routes";
import AuthRouter from "./routes/auth.routes";
import InfluencerRouter from "./routes/professional/influencer.routes";
import OrganizerRouter from "./routes/professional/organizer.routes";
import { PlanRouter } from "./routes/subs";
import SubscriptionRouter from "./routes/subs/subscription.routes";

export default function router(server: Express) {
  server.get("/healthcheck", (req: Request, res: Response) =>
    res.status(HTTP.OK).json({ message: "Server's running just fine.🚀" })
  );

  // TODO: Refactor routers and make them get imported from a single file
  server.use("/accounts", UserRouter);
  server.use("/auth", AuthRouter);
  server.use("/influencers", InfluencerRouter);
  server.use("/organizers", OrganizerRouter);
  server.use("/plans", PlanRouter);
  server.use("/subscriptions", SubscriptionRouter);
}
