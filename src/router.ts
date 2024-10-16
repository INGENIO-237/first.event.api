import { Express, Request, Response } from "express";
import HTTP from "./utils/constants/http.responses";
import {
  AuthRouter,
  InfluencerRouter,
  OrganizerRouter,
  PaymentsRouter,
  PlanRouter,
  SubscriptionRouter,
  UserRouter,
  EventsRouter,
  CouponsRouter,
  ProductsRouter,
} from "./routes";

export default function router(server: Express) {
  server.get("/healthcheck", (req: Request, res: Response) =>
    res.status(HTTP.OK).json({ message: "Server's running just fine.🚀" })
  );

  server.use("/accounts", UserRouter);
  server.use("/auth", AuthRouter);
  server.use("/influencers", InfluencerRouter);
  server.use("/organizers", OrganizerRouter);
  server.use("/plans", PlanRouter);
  server.use("/subscriptions", SubscriptionRouter);
  server.use("/payments", PaymentsRouter);
  server.use("/events", EventsRouter);
  server.use("/coupons", CouponsRouter);
  server.use("/products", ProductsRouter);
}
