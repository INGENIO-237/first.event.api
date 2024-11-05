import { InferSchemaType, Schema } from "mongoose";
import Order, { IOrder } from "./order.model";

const productOrderSchema = new Schema({
  items: [
    {
      product: {
        type: Schema.Types.ObjectId,
        ref: "Product",
        required: true,
      },
      quantity: {
        type: Number,
        required: true,
        default: 1,
      },
    },
  ],
});

export interface IProductOrder
  extends IOrder,
    InferSchemaType<typeof productOrderSchema> {}

const ProductOrder = Order.discriminator<IProductOrder>(
  "ProductOrder",
  productOrderSchema
);

export default ProductOrder;
