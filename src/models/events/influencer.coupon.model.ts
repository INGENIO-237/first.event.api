import { InferSchemaType, Schema } from "mongoose";
import Coupon, { ICoupon } from "./coupon.model";

const influencerCouponSchema = new Schema({
  influencer: {
    type: String,
    ref: "Profile",
    required: true,
  },
  share: {
    type: Number,
    required: true,
  },
});

export interface IInfluencerCoupon
  extends ICoupon,
    InferSchemaType<typeof influencerCouponSchema> {}

const InfluencerCoupon = Coupon.discriminator<IInfluencerCoupon>(
  "InfluencerCoupon",
  influencerCouponSchema
);

export default InfluencerCoupon;
