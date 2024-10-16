import { Types } from "mongoose";
import { object, string, number, z } from "zod";

export const getProductCouponsSchema = object({
  query: object({
    product: string({
      invalid_type_error:
        "L'Identifiant du produit doit être une chaîne de caractères",
    }).refine((val) => Types.ObjectId.isValid(val), {
      message: "Identifiant d'événement non valide",
    }),
  }),
});

export type GetCoupons = z.infer<typeof getProductCouponsSchema>;

export const registerProductCouponSchema = object({
  body: object({
    product: string({
      required_error: "L'Identifiant du produit est requis",
      invalid_type_error:
        "L'Identifiant du produit doit être une chaîne de caractères",
    }).refine((val) => Types.ObjectId.isValid(val), {
      message: "Identifiant d'événement non valide",
    }),
    code: string({
      required_error: "Le code coupon est requis",
      invalid_type_error: "Le code coupon doit être une chaîne de caractères",
    }).refine((val) => val.length === 5, {
      message: "Le code coupon doit contenir exactement 5 caractères",
    }),
    discount: number({
      required_error: "La réduction est requise",
      invalid_type_error: "La réduction doit être un nombre",
    }).min(0, "La réduction doit être supérieure ou égale à 0"),
    influencer: string({
      invalid_type_error:
        "L'Identifiant de l'influenceur doit être une chaîne de caractères",
    }).optional(),
    share: number({
      invalid_type_error: "Le pourcentage de partage doit être un nombre",
    }).optional(),
  }).superRefine((data, ctx) => {
    if (data.influencer && !Types.ObjectId.isValid(data.influencer)) {
      ctx.addIssue({
        code: z.ZodIssueCode.custom,
        message:
          "L'Identifiant de l'influenceur doit être une chaîne de caractères valide",
        path: ["influencer"],
      });
    }

    if (data.share && (data.share < 0 || data.share > 100)) {
      ctx.addIssue({
        code: z.ZodIssueCode.custom,
        message: "Le pourcentage de partage doit être compris entre 0 et 100",
        path: ["share"],
      });
    }

    if (data.influencer && !data.share) {
      ctx.addIssue({
        code: z.ZodIssueCode.custom,
        message:
          "Le pourcentage de partage est requis lorsque l'influenceur est spécifié",
        path: ["share"],
      });
    }

    if (data.share && !data.influencer) {
      ctx.addIssue({
        code: z.ZodIssueCode.custom,
        message:
          "L'influenceur est requis lorsque le pourcentage de partage est spécifié",
        path: ["influencer"],
      });
    }
  }),
});

export type RegisterCoupon = z.infer<typeof registerProductCouponSchema>;

export const updateProductCouponSchema = object({
  params: object({
    coupon: string({
      required_error: "L'Identifiant du coupon est requis",
      invalid_type_error:
        "L'Identifiant du coupon doit être une chaîne de caractères",
    }).refine(
      (data) => Types.ObjectId.isValid(data),
      "L'Identifiant du coupon doit être une chaîne de caractères valide"
    ),
  }),
  body: object({
    code: string({
      invalid_type_error: "Le code coupon doit être une chaîne de caractères",
    })
      .optional()
      .refine(
        (val) => {
          if (!val) return true;

          return val.length === 5;
        },
        {
          message: "Le code coupon doit contenir exactement 5 caractères",
        }
      ),
    discount: number({
      invalid_type_error: "La réduction doit être un nombre",
    })
      .optional()
      .refine((val) => {
        if (!val) return true;

        return val >= 0;
      }, "La réduction doit être supérieure ou égale à 0"),
    share: number({
      invalid_type_error: "Le pourcentage de partage doit être un nombre",
    }).optional(),
    status: string().optional(),
  })
    .optional()
    .superRefine((data, ctx) => {
      if (data) {
        if (data.share && (data.share < 0 || data.share > 100)) {
          ctx.addIssue({
            code: z.ZodIssueCode.custom,
            message:
              "Le pourcentage de partage doit être compris entre 0 et 100",
            path: ["share"],
          });
        }

        if(data.status && data.status !== "active" && data.status !== "inactive") {
          ctx.addIssue({
            code: z.ZodIssueCode.custom,
            message: "Le statut du coupon doit être 'active' ou 'inactive'",
            path: ["status"],
          });
        }
      }
    }),
});

export type UpdateCoupon = z.infer<typeof updateProductCouponSchema>;
