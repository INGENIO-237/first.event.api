import { Document, InferSchemaType, model, Types } from "mongoose";
import { Schema } from "mongoose";
import { PAYMENT_STATUS } from "../../utils/constants/payments-and-subs";

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
      type: [{ code: String, discount: Number, rate: Number, share: Number }],
      default: [],
    },
    failMessage: {
      type: String,
    },
    receipt: {
      type: String,
    },
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
    fundsDispatched: {
      type: Boolean,
      default: false,
    },
    fundsDispatchedOn: {
      type: Date,
    },

    // TODO: Pass taxes property here
  },
  {
    timestamps: true,
    discriminatorKey: "type",
    toJSON: { virtuals: true },
    toObject: { virtuals: true },
  }
);

export interface IPayment
  extends Document,
    InferSchemaType<typeof paymentSchema> {}

paymentSchema.pre<IPayment>("save", function (next) {
  const payment = this;

  if (!payment.status) {
    payment.status = PAYMENT_STATUS.INITIATED;
  }

  next();
});

const Payment = model<IPayment>("Payment", paymentSchema);

export default Payment;
