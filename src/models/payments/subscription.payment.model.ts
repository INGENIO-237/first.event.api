import "reflect-metadata";

import { InferSchemaType, Schema, Types } from "mongoose";
import Payment, { IPayment } from "./payment";
import { BILLING_TYPE } from "../../utils/constants/plans-and-subs";
import Container from "typedi";
import { PlanServices } from "../../services/subs";
import { IPlan } from "../subs/plan.model";

const subscriptionPaymentSchema = new Schema({
  plan: {
    type: Types.ObjectId,
    ref: "Plan",
    required: true,
  },
  billed: {
    type: String,
    required: true,
    enum: [...Object.values(BILLING_TYPE)],
  },
  unitPrice: {
    type: Number,
  },

  // TODO: Pass taxes property here
});

export interface ISubscriptionPayment
  extends IPayment,
    InferSchemaType<typeof subscriptionPaymentSchema> {}

// Set subscription unit price from plan's monthly or yearly price
subscriptionPaymentSchema.pre<ISubscriptionPayment>(
  "save",
  async function (next) {
    const sub = this;

    const plan = Container.get(PlanServices);
 
    const { monthlyPrice, yearlyPrice } = (await plan.getPlan(
      sub.plan as string
    )) as IPlan;

    sub.unitPrice =
      sub.billed == BILLING_TYPE.MONTHLY ? monthlyPrice : yearlyPrice;

    next();
  }
);

const SubscriptionPayment = Payment.discriminator<ISubscriptionPayment>(
  "SubscriptionPayment",
  subscriptionPaymentSchema
);

export default SubscriptionPayment;
