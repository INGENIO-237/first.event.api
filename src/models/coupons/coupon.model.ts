import { Document, InferSchemaType, model, Schema, Types } from "mongoose";
import { COUPON_STATUS } from "../../utils/constants/common";

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
      enum: [...Object.values(COUPON_STATUS)],
      default: COUPON_STATUS.ACTIVE,
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
