import { Document, InferSchemaType, model, Schema } from "mongoose";

// TODO: Add websockets for updating cart in realtime
const cartSchema = new Schema({
  user: {
    type: Schema.Types.ObjectId,
    ref: "User",
    required: true,
  },
  items: {
    type: [
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
    default: [],
  },
});

export interface ICart extends Document, InferSchemaType<typeof cartSchema> {}

const Cart = model<ICart>("Cart", cartSchema)

export default Cart;
