import { Document, InferSchemaType, model, Schema, Types } from "mongoose";

const subscriptionSchema = new Schema(
  {
    payment: { 
      type: Types.ObjectId,
      ref: "SubscriptionPayment",
    },
    freemiumEndsOn: {
      type: Date,
      required: true,
    },
    startsOn: {
      type: Date,
      required: true,
    },
    endsOn: {
      type: Date,
      required: true,
    },
    hasBeenCancelled: {
      type: Boolean,
      default: false,
    },
    cancelDate: Date,
  },
  { timestamps: true }
);

export interface ISubscription
  extends Document,
    InferSchemaType<typeof subscriptionSchema> {}

const Subscription = model<ISubscription>("Subscription", subscriptionSchema);

export default Subscription;
