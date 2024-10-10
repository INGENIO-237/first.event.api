import { Document, InferSchemaType, model, Schema } from "mongoose";
import {
  ASSISTANCE,
  PLANS,
  TICKETS_PER_EVENT,
} from "../../utils/constants/plans-and-subs";

const planSchema = new Schema({
  name: {
    type: String,
    required: true,
    enum: [...Object.values(PLANS)],
  },
  monthlyPrice: {
    type: Number,
    required: true,
  },
  yearlyPrice: {
    type: Number,
    required: true,
  },
  tryDays: {
    type: Number,
    required: true,
  },
  ticketsPerEvent: {
    type: String,
    enum: [...Object.values(TICKETS_PER_EVENT)],
    required: true,
  },
  assistance: {
    type: String,
    enum: [...Object.values(ASSISTANCE)],
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
});

export interface IPlan extends Document, InferSchemaType<typeof planSchema> {}

const Plan = model<IPlan>("Plan", planSchema);

export default Plan;
