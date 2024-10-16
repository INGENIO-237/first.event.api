import UserRouter from "./user.routes";
import AuthRouter from "./auth.routes";
import { InfluencerRouter, OrganizerRouter } from "./professionals";
import { PlanRouter, SubscriptionRouter } from "./subs";
import PaymentsRouter from "./payments.routes";
import EventsRouter from "./events/event.routes";
import CouponsRouter from "./events/coupon.routes";
import ProductsRouter from "./products/product.routes";

// TODO: Subscriptions routes

export {
  UserRouter,
  AuthRouter,
  InfluencerRouter,
  OrganizerRouter,
  PlanRouter,
  SubscriptionRouter,
  PaymentsRouter,
  EventsRouter,
  CouponsRouter,
  ProductsRouter
};
