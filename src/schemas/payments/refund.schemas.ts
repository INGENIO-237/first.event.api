import { object } from "zod";

export type CreateRefund = {
  amount: number;
  refundRef: string;
  paymentIntent: string;
  refundType: string;
  payment: string;
};

// export const requestSubscriptionCancellation = object({
//     query: 
// })