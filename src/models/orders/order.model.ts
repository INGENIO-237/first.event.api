import { InferSchemaType, model, Schema } from "mongoose";
import { PAYMENT_STATUS } from "../../utils/constants/plans-and-subs";

const orderSchema = new Schema(
  {
    user: {
      type: Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },
    status: {
      type: String,
      enum: [...Object.values(PAYMENT_STATUS)],
      default: PAYMENT_STATUS.INITIATED,
    },
  },
  {
    timestamps: true,
    discriminatorKey: "type",
  }
);

export interface IOrder extends Document, InferSchemaType<typeof orderSchema> {}

const Order = model("Order", orderSchema);

export default Order;
