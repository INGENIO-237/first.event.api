import { Types } from "mongoose";
import { array, boolean, number, object, optional, string, z } from "zod";
import { DiscountedCoupon } from "../../utils/constants/common";
import { PAYMENT_STATUS } from "../../utils/constants/plans-and-subs";

export const createTicketPaymentSchema = object({
  body: object({
    event: string({
      required_error: "L'identifiant de l'événement est requis",
      invalid_type_error:
        "L'identifiant de l'événement doit être une chaîne de caractères",
    }).refine((data) => Types.ObjectId.isValid(data), {
      message: "L'identifiant de l'événement n'est pas valide",
    }),
    tickets: object(
      {
        cat: string(),
        quantity: number(),
      },
      {
        required_error: "Le type de billet est requis",
        invalid_type_error:
          "Le type de billet doit être une chaîne de caractères",
      }
    ).array(),
    billing: object(
      {
        content: optional(
          object({
            address: string({
              required_error: "L'adresse requise",
              invalid_type_error:
                "L'adresse du domicile doit être une chaîne de caractères",
            }),
            country: string({
              required_error: "Le pays requis",
              invalid_type_error:
                "Le pays du domicile doit être une chaîne de caractères",
            }),
            state: string({
              required_error: "La région requise",
              invalid_type_error:
                "La région du domicile doit être une chaîne de caractères",
            }),
            city: string({
              required_error: "La ville requise",
              invalid_type_error:
                "La ville du domicile doit être une chaîne de caractères",
            }),
            zipCode: string({
              required_error: "Le code postal requis",
              invalid_type_error:
                "Le code postal du domicile doit être une chaîne de caractères",
            }),
          })
        ),
        sameAsProfile: boolean({
          required_error: "Pareille que l'adresse de facturation de base?",
          invalid_type_error:
            "'Pareille que l'adresse de facturation de base' doit être un booléen",
        }),
      },
      {
        required_error: "L'adresse de facturation est requise",
        invalid_type_error:
          "L'adresse de facturation doit être une adresse valide",
      }
    ).superRefine((data, ctx) => {
      // Either same as home or different
      if (data.content && data.sameAsProfile) {
        ctx.addIssue({
          code: z.ZodIssueCode.custom,
          message:
            "Addresse de facturation invalide. Soit c'est la même chose que l'adresse de facturation de base soit c'est différent. Mais pas les deux en même temps",
        });
      }
      if (!data.content && !data.sameAsProfile) {
        ctx.addIssue({
          code: z.ZodIssueCode.custom,
          message:
            "Addresse de facturation invalide. Soit c'est la même chose que l'adresse de facturation de base soit il faut fournir une adresse différente",
        });
      }
    }),
    shipping: object(
      {
        content: optional(
          object({
            address: string({
              required_error: "L'adresse requise",
              invalid_type_error:
                "L'adresse du domicile doit être une chaîne de caractères",
            }),
            country: string({
              required_error: "Le pays requis",
              invalid_type_error:
                "Le pays du domicile doit être une chaîne de caractères",
            }),
            state: string({
              required_error: "La région requise",
              invalid_type_error:
                "La région du domicile doit être une chaîne de caractères",
            }),
            city: string({
              required_error: "La ville requise",
              invalid_type_error:
                "La ville du domicile doit être une chaîne de caractères",
            }),
            zipCode: string({
              required_error: "Le code postal requis",
              invalid_type_error:
                "Le code postal du domicile doit être une chaîne de caractères",
            }),
          })
        ),
        sameAsProfile: boolean({
          required_error: "Pareille que l'adresse de livraison de base?",
          invalid_type_error:
            "'Pareille que l'adresse de livraison de base' doit être un booléen",
        }),
      },
      {
        required_error: "L'adresse de livraison est requise",
        invalid_type_error:
          "L'adresse de livraison est requise doit être une adresse valide",
      }
    ).superRefine((data, ctx) => {
      // Either same as home or different
      if (data.content && data.sameAsProfile) {
        ctx.addIssue({
          code: z.ZodIssueCode.custom,
          message:
            "Addresse de livraison invalide. Soit c'est la même chose que l'adresse de livraison de base soit c'est différent. Mais pas les deux en même temps",
        });
      }
      if (!data.content && !data.sameAsProfile) {
        ctx.addIssue({
          code: z.ZodIssueCode.custom,
          message:
            "Addresse de livraison invalide. Soit c'est la même chose que l'adresse de livraison de base soit il faut fournir une adresse différente",
        });
      }
    }),
    paymentMethodId: string({
      invalid_type_error:
        "L'identifiant du mode de paiement doit être une chaîne de caractères",
    }).optional(),
    coupons: array(
      string({
        required_error: "Le code du coupon est requis",
        invalid_type_error:
          "Le code du coupon doit être une chaîne de caractères",
      })
    )
      .optional()
      .refine(
        (data) => {
          if (!data) return true;

          return data.length > 0;
        },
        {
          message: "Au moins un coupon est requis",
          path: ["coupons"],
        }
      ),
  }),
});

export type CreateTicketPaymentInput = z.infer<
  typeof createTicketPaymentSchema
>;
export type CreateTicketPaymentPayload = CreateTicketPaymentInput["body"] & {
  user: string;
};

export type TicketPaymentPayload = {
  user: string;
  paymentIntent: string;
  amount: number;
  fees: number;
  coupons?: DiscountedCoupon[];
  tickets: {
    cat: string;
    quantity: number;
    price: number;
  }[];
  event: string;
  billing: {
    content?: {
      address: string;
      country: string;
      state: string;
      city: string;
      zipCode: string;
    };
    sameAsProfile: boolean;
  };
  shipping: {
    content?: {
      address: string;
      country: string;
      state: string;
      city: string;
      zipCode: string;
    };
    sameAsProfile: boolean;
  };
  status?: PAYMENT_STATUS;
};

export const requestTicketPaymentRefund = object({
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

export type RequestTicketPaymentRefundInput = z.infer<
  typeof requestTicketPaymentRefund
>;