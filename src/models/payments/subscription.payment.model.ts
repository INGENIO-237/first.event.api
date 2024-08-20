import { InferSchemaType, Schema, Types } from "mongoose";
import Payment, { IPayment } from "./payment";
import { BILLING_TYPE } from "../../utils/constants/plans-and-subs";

const subscriptionPaymentSchema = new Schema({
  plan: {
    type: Types.ObjectId,
    ref: "Plan",
  },
  billed: {
    type: String,
    required: true,
    enum: [...Object.values(BILLING_TYPE)],
  },
});

export interface ISubscriptionPayment
  extends IPayment,
    InferSchemaType<typeof subscriptionPaymentSchema> {}

const SubscriptionPayment = Payment.discriminator<ISubscriptionPayment>(
  "SubscriptionPayment",
  subscriptionPaymentSchema
);

export default SubscriptionPayment;
