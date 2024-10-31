import { Document, InferSchemaType, model, Types } from "mongoose";
import { Schema } from "mongoose";
import { PAYMENT_STATUS } from "../../utils/constants/plans-and-subs";

const paymentSchema = new Schema(
  {
    user: {
      type: Types.ObjectId,
      ref: "User",
    },
    amount: {
      type: Number,
      required: true,
    },
    fees: {
      type: Number,
      required: true,
    },
    trxRef: String,
    paymentIntent: {
      type: String,
      required: true,
    },
    status: {
      type: String,
      enum: [...Object.values(PAYMENT_STATUS)],
    },
    coupons: {
      type: [String],
      default: [],
    },
    failMessage: {
      type: String,
    },
    receipt: {
      type: String,
    },
  },
  { timestamps: true, discriminatorKey: "type" }
);

export interface IPayment
  extends Document,
    InferSchemaType<typeof paymentSchema> {}

paymentSchema.pre<IPayment>("save", function (next) {
  const payment = this;

  payment.status = PAYMENT_STATUS.INITIATED;

  next();
});

const Payment = model<IPayment>("Payment", paymentSchema);

export default Payment;
