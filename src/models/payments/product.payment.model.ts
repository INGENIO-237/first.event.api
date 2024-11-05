import { InferSchemaType, Schema } from "mongoose";
import Payment, { IPayment } from "./payment.model";

// TODO: Once payment is completed, send success notification email
const productPaymentSchema = new Schema({
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
  billing: {
    type: {
      content: {
        address: String,
        country: String,
        state: String,
        city: String,
        zipCode: String,
      },
      sameAsProfile: {
        type: Boolean,
        default: true,
      },
    },
    required: true,
  },
  shipping: {
    type: {
      content: {
        address: String,
        country: String,
        state: String,
        city: String,
        zipCode: String,
      },
      sameAsProfile: {
        type: Boolean,
        default: true,
      },
    },
    required: true,
  },
});

// TODO: Move shipping and billing one level above

export interface IProductPayment
  extends IPayment,
    InferSchemaType<typeof productPaymentSchema> {}

const ProductPayment = Payment.discriminator<IProductPayment>(
  "ProductPayment",
  productPaymentSchema
);

export default ProductPayment;
