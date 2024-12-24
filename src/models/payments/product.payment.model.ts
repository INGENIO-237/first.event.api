import { InferSchemaType, Schema } from "mongoose";
import Payment, { IPayment } from "./payment.model";
import Refund from "./refund.model";

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
});

productPaymentSchema.virtual("refund").get(async function () {
  const payment = this as IProductPayment;
  const refund = await Refund.findOne({
    $or: [{ payment: payment._id }, { paymentIntent: payment.paymentIntent }],
  });
  return refund;
});

export interface IProductPayment
  extends IPayment,
    InferSchemaType<typeof productPaymentSchema> {
  refund: InstanceType<typeof Refund> | null;
}

const ProductPayment = Payment.discriminator<IProductPayment>(
  "ProductPayment",
  productPaymentSchema
);

export default ProductPayment;
