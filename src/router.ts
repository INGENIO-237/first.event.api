import { Express, Request, Response } from "express";
import {
  AuthRouter,
  CartRouter,
  CouponsRouter,
  EventsRouter,
  InfluencerRouter,
  OrganizerRouter,
  PaymentsRouter,
  PlanRouter,
  ProductsRouter,
  ReviewsRouter,
  SubscriptionRouter,
  UserRouter,
} from "./routes";
import HTTP from "./utils/constants/http.responses";

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
  server.use("/cart", CartRouter);
  server.use("/reviews", ReviewsRouter);
}
