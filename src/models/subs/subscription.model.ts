import { Document, InferSchemaType, model, Schema, Types } from "mongoose";
import { ASSISTANCE, TICKETS_PER_EVENT } from "../../utils/constants/plans-and-subs";

const subscriptionSchema = new Schema(
  {
    payment: {
      type: Types.ObjectId,
      ref: "SubscriptionPayment",
      required: true,
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
    ticketsPerEvent: {
      type: String,
      // enum: [...Object.values(TICKETS_PER_EVENT)],
      required: true,
    },
    assistance: {
      type: String,
      // enum: [...Object.values(ASSISTANCE)],
      required: true,
    },
    couponsPerEvent: {
      type: String,
      required: true,
    },
    promotion: {
      type: Number,
      default: 0,
    },
  },
  { timestamps: true }
);

export interface ISubscription
  extends Document,
    InferSchemaType<typeof subscriptionSchema> {}

const Subscription = model<ISubscription>("Subscription", subscriptionSchema);

export default Subscription;
