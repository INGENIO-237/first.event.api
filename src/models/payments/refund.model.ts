import { InferSchemaType, Schema, Types } from "mongoose";
import Payment, { IPayment } from "./payment.model";
import { PAYMENT_TYPE } from "../../utils/constants/common";
import { REFUND_TYPES } from "../../utils/constants/plans-and-subs";

const refundSchema = new Schema({
  refundRef: {
    type: String,
    required: true,
  },
  refundType: {
    type: String,
    enum: [...Object.values(REFUND_TYPES)],
    required: true,
  },
  payment: {
    type: Types.ObjectId,
    refPath: "refundType",
    required: true,
  },
});

export interface IRefund
  extends IPayment,
    InferSchemaType<typeof refundSchema> {}

const Refund = Payment.discriminator<IRefund>("Refund", refundSchema);

export default Refund;
