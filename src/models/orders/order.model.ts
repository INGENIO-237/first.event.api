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
    billing: {
      type: {
        address: { type: String, required: true },
        country: { type: String, required: true },
        state: { type: String, required: true },
        city: { type: String, required: true },
        zipCode: { type: String, required: true },
      },
      required: true,
    },
    shipping: {
      type: {
        address: { type: String, required: true },
        country: { type: String, required: true },
        state: { type: String, required: true },
        city: { type: String, required: true },
        zipCode: { type: String, required: true },
      },
      required: true,
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
