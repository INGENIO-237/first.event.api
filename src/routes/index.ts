import UserRouter from "./user.routes";
import AuthRouter from "./auth.routes";
import { InfluencerRouter, OrganizerRouter } from "./professionals";
import { PlanRouter, SubscriptionRouter } from "./subs";
import PaymentsRouter from "./payments.routes";
import EventsRouter from "./events/event.routes";
import CouponsRouter from "./coupon.routes";
import ProductsRouter from "./products/product.routes";
import OrdersRouter from "./orders.routes";

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
  ProductsRouter,
  OrdersRouter
};
