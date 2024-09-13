import { Document, InferSchemaType, model, Schema, Types } from "mongoose";

const paymentMethodSchema = new Schema({
  user: {
    type: Types.ObjectId,
    ref: "User",
    required: true,
  },
  paymentMethodId: {
    type: String,
    required: true,
  },
  card: {
    type: {
      brand: {
        type: String,
        required: true,
      },
      country: {
        type: String,
        required: true,
      },
      expMonth: {
        type: Number,
        required: true,
      },
      expYear: {
        type: Number,
        required: true,
      },
      last4: {
        type: Number,
        required: true,
      },
    },
    required: true,
  },
});

export interface IPaymentMethod
  extends Document,
    InferSchemaType<typeof paymentMethodSchema> {}

const PaymentMethod = model<IPaymentMethod>(
  "Payment Method",
  paymentMethodSchema
);

export default PaymentMethod;
