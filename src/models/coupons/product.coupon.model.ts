import { InferSchemaType, Schema, Types } from "mongoose";
import Coupon, { ICoupon } from "./coupon.model";

// TODO: Remove this
const productCouponSchema = new Schema({
  product: {
    type: Types.ObjectId,
    ref: "Product",
    required: true,
  },
});

export interface IProductCoupon
  extends ICoupon,
    InferSchemaType<typeof productCouponSchema> {}

const ProductCoupon = Coupon.discriminator<IProductCoupon>(
  "ProductCoupon",
  productCouponSchema
);

export default ProductCoupon;
