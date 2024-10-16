import { Document, InferSchemaType, model, Schema, Types } from "mongoose";

const couponSchema = new Schema({
  product: {
    type: Types.ObjectId,
    ref: "Product",
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

export interface IProductCoupon
  extends Document,
    InferSchemaType<typeof couponSchema> {}

const ProductCoupon = model<IProductCoupon>("ProductCoupon", couponSchema);

export default ProductCoupon;
