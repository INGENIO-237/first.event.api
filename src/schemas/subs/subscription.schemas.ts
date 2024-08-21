import { array, nativeEnum, object, optional, string, z } from "zod";
import { BILLING_TYPE } from "../../utils/constants/plans-and-subs";
import { Types } from "mongoose";

export const registerSubscriptionSchema = object({
  body: object({
    billed: nativeEnum(BILLING_TYPE, {
      required_error: "Le type de facturation est requis",
      invalid_type_error:
        "Le type de facturation est soit 'Annuel' ou 'Mensuel'",
    }),
    plan: string({ required_error: "Le plan à souscrire est requis" }),
    coupons: optional(
      array(
        string({
          invalid_type_error:
            "Le coupon de réduction doit être une chaîne de caractères",
        })
      )
    ),
  }).superRefine((data, ctx) => {
    try {
      new Types.ObjectId(data.plan);
    } catch (error) {
      ctx.addIssue({
        code: z.ZodIssueCode.custom,
        message: "Le format de la référence du plan à souscrire est invalide",
      });
    }

    if (data.coupons) {
      data.coupons.forEach((coupon) => {
        if (coupon.length !== 5) {
          ctx.addIssue({
            code: z.ZodIssueCode.custom,
            message: "Coupon de réduction invalide",
          });
        }
      });
    }
  }),
});

export type RegisterSubscription = z.infer<typeof registerSubscriptionSchema>;

export type SubscriptionPaymentPayload = RegisterSubscription["body"] & {
  user: string;
  paymentIntent: string;
  amount: number;
};

export type CreateSubscription = {
  payment: string;
  freemiumEndsOn: Date;
  startsOn: Date;
  endsOn: Date;
};
