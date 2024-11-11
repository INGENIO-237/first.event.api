import "reflect-metadata";

import { InferSchemaType, Schema, Types } from "mongoose";
import Container from "typedi";
import PlanServices from "../../services/subs/plan.services";
import { BILLING_TYPE } from "../../utils/constants/plans-and-subs";
import { IPlan } from "../subs/plan.model";
import Payment, { IPayment } from "./payment.model";
import Refund from "./refund.model";

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
});

subscriptionPaymentSchema.virtual("refund").get(async function () {
  const payment = this as ISubscriptionPayment;
  const refund = await Refund.findOne({
    $or: [{ payment: payment._id }, { paymentIntent: payment.paymentIntent }],
  });
  return refund;
});

export interface ISubscriptionPayment
  extends IPayment,
    InferSchemaType<typeof subscriptionPaymentSchema> {
  refund: InstanceType<typeof Refund> | null;
}

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
