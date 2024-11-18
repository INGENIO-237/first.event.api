import AuthRouter from "./auth.routes";
import EventBookmarkRouter from "./bookmarks/event.bookmark.routes";
import CartRouter from "./cart.routes";
import CouponsRouter from "./coupon.routes";
import EventsRouter from "./events/event.routes";
import PaymentsRouter from "./payments.routes";
import ProductsRouter from "./products/product.routes";
import { InfluencerRouter, OrganizerRouter } from "./professionals";
import ReportsRouter from "./report.routes";
import ReviewsRouter from "./reviews.routes";
import { PlanRouter, SubscriptionRouter } from "./subs";
import UserRouter from "./user.routes";

export {
  AuthRouter,
  CartRouter,
  CouponsRouter,
  EventBookmarkRouter,
  EventsRouter,
  InfluencerRouter,
  OrganizerRouter,
  PaymentsRouter,
  PlanRouter,
  ProductsRouter,
  ReportsRouter,
  ReviewsRouter,
  SubscriptionRouter,
  UserRouter,
};
