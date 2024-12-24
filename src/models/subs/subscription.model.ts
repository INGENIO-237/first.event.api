import { Document, InferSchemaType, model, Schema, Types } from "mongoose";
import SubscriptionPayment, {
  ISubscriptionPayment,
} from "../payments/subscription.payment.model";
import Plan, { IPlan } from "./plan.model";

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
    remainingFreeTickets: {
      type: Number,
      default: 0,
    },
  },
  { timestamps: true }
);

// TODO: Handle free tickets tracking
// subscriptionSchema.pre<ISubscription>("save", async function (next) {
//   let sub = this;

// if(sub.isNew){

//   const { plan } = (await SubscriptionPayment.findById(
//     sub.payment
//   )) as ISubscriptionPayment;
//   const {} = await Plan.findById(plan) as IPlan;
// }

// });

export interface ISubscription
  extends Document,
    InferSchemaType<typeof subscriptionSchema> {}

const Subscription = model<ISubscription>("Subscription", subscriptionSchema);

export default Subscription;
