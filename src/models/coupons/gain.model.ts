import { Document, InferSchemaType, model, Schema } from "mongoose";
import { ORDER_PAYMENT_TYPE, ORDER_TYPE } from "../../utils/constants/common";
import { PAYMENT_STATUS } from "../../utils/constants/plans-and-subs";

const gainSchema = new Schema(
  {
    amount: {
      type: Number,
      required: true,
    },
    coupon: {
      type: Schema.Types.ObjectId,
      ref: "Coupon",
    },
    orderType: {
      type: String,
      required: true,
      enum: [...Object.values(ORDER_TYPE)],
    },
    order: {
      type: Schema.Types.ObjectId,
      refPath: "orderType",
      required: true,
    },
    status: {
      type: String,
      default: PAYMENT_STATUS.INITIATED,
      enum: [...Object.values(PAYMENT_STATUS)],
    },
    paymentType: {
      type: String,
      required: true,
      enum: [...Object.values(ORDER_PAYMENT_TYPE)],
    },
    payment: {
      type: Schema.Types.ObjectId,
      refPath: "paymentType",
    },
  },
  {
    timestamps: true,
    versionKey: false,
  }
);

export interface IGain extends Document, InferSchemaType<typeof gainSchema> {}

const Gain = model<IGain>("Gain", gainSchema);

export default Gain;
