import { InferSchemaType, Schema } from "mongoose";
import ProductCoupon, { IProductCoupon } from "./product.coupon.model";

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

export interface IProductInfluencerCoupon
  extends IProductCoupon,
    InferSchemaType<typeof influencerCouponSchema> {}

const InfluencerCoupon = ProductCoupon.discriminator<IProductInfluencerCoupon>(
  "ProductInfluencerCoupon",
  influencerCouponSchema
);

export default InfluencerCoupon;
