import { Types } from "mongoose";
import { object, string, z } from "zod";

export type CreateRefund = {
  amount: number;
  refundRef: string;
  paymentIntent: string;
  refundType: string;
  payment: string;
  acquirerReferenceNumber: string
};

export const requestPaymentRefundSchema = object({
  params: object({
    payment: string({
      required_error: "L'identifiant du paiement est requis",
      invalid_type_error:
        "L'identifiant du paiement doit être une chaîne de caractères",
    }).refine((data) => Types.ObjectId.isValid(data), {
      message: "L'identifiant du paiement n'est pas valide",
    }),
  }),
});

export type RequestPaymentRefundInput = z.infer<
  typeof requestPaymentRefundSchema
>;