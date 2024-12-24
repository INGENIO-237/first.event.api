import { array, nativeEnum, number, object, optional, string, z } from "zod";
import {
  ASSISTANCE,
  BILLING_TYPE,
  TICKETS_PER_EVENT,
} from "../../utils/constants/payments-and-subs";
import { Types } from "mongoose";
import config from "../../config";

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
    paymentMethodId: optional(string()),
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
        if (coupon.length !== config.COUPON_LENGTH) {
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
  ticketsPerEvent: TICKETS_PER_EVENT;
  assistance: ASSISTANCE;
  couponsPerEvent: string;
  promotion: number;
};

export const getSubscriptionSchema = object({
  params: object({
    subscription: string({
      required_error: "L'identifiant de l'abonnement est requis",
      invalid_type_error:
        "L'identifiant de l'abonnement doit être une chaîne de caractères",
    }),
  }),
});

export type GetSubscription = z.infer<typeof getSubscriptionSchema>;

export const getSubscriptionsSchema = object({
  query: object({
    page: optional(
      number({
        invalid_type_error: "Le numéro de la page doit être un nombre",
      }).min(1, {
        message: "Le numéro de la page doit être supérieur ou égal à 1",
      })
    ),
    limit: optional(
      number({
        invalid_type_error: "La limite doit être un nombre",
      })
    ),
    target: optional(
      string({
        invalid_type_error:
          "L'identifiant de l'organisateur doit être une chaîne de caractères",
      }).refine((data) => Types.ObjectId.isValid(data), {
        message: "L'identifiant de l'organisateur est invalide",
      })
    ),
  }),
});

export type GetSubscriptions = z.infer<typeof getSubscriptionsSchema>;
