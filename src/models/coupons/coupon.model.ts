import { Document, InferSchemaType, model, Schema, Types } from "mongoose";

export const couponSchema = new Schema(
  {
    code: {
      type: String,
      required: true,
    },
    discount: {
      type: Number,
      required: true,
    },
    status: {
      type: String,
      enum: ["active", "inactive"],
      default: "active",
    },
    influencer: {
      type: Types.ObjectId,
      ref: "Influencer",
      default: undefined,
    },
    share: Number,
  },
  {
    timestamps: true,
    discriminatorKey: "type",
  }
);

export interface ICoupon
  extends Document,
    InferSchemaType<typeof couponSchema> {}

const Coupon = model<ICoupon>("Coupon", couponSchema);

export default Coupon;
