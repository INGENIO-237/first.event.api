import "reflect-metadata";

import { InferSchemaType, Schema, Types } from "mongoose";
import Payment, { IPayment } from "./payment.model";
import { REFUND_TYPES } from "../../utils/constants/plans-and-subs";
// import Container from "typedi";
// import SubscriptionServices from "../../services/subs/subscription.services";

const refundSchema = new Schema({
  refundRef: {
    type: String,
    required: true,
  },
  acquirerReferenceNumber: String,
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

// refundSchema.post("save", async function (doc, next) {
//   if (doc.isNew) {
//     const subService = Container.get(SubscriptionServices);

//     const { _id: subscriptionId } = await subService.getSubscription({
//       payment: doc.payment as string,
//     });

//     // Update sub to set cancellation info
//     if (subscriptionId) {
//       await subService.updateSubscription({
//         subscriptionId: subscriptionId as string,
//         hasBeenCancelled: true,
//         cancelDate: new Date(),
//       });
//     }

//     next();
//   }
// });

const Refund = Payment.discriminator<IRefund>("Refund", refundSchema);

export default Refund;
