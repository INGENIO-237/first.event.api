import { InferSchemaType, model, Schema, Types } from "mongoose";
import Coupon, { ICoupon } from "./coupon.model";

const ticketCouponSchema = new Schema({
  event: {
    type: Types.ObjectId,
    ref: "Event",
    required: true,
  },
});

export interface ITicketCoupon
  extends ICoupon,
    InferSchemaType<typeof ticketCouponSchema> {}

const TicketCoupon = Coupon.discriminator<ITicketCoupon>(
  "TicketCoupon",
  ticketCouponSchema
);

export default TicketCoupon;
