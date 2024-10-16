import { Document, InferSchemaType, model, Schema, Types } from "mongoose";

export const couponSchema = new Schema({
  event: {
    type: Types.ObjectId,
    ref: "Event",
    required: true,
  },
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
  }
}, {
  timestamps: true,
  discriminatorKey: "type"
});

export interface ICoupon
  extends Document,
    InferSchemaType<typeof couponSchema> {}

const Coupon = model<ICoupon>("Coupon", couponSchema);

export default Coupon;
