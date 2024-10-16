import { Types } from "mongoose";
import { object, string, number, z } from "zod";

export const getCouponsSchema = object({
  query: object({
    event: string({
      required_error: "L'Identifiant de l'événement est requis",
      invalid_type_error:
        "L'Identifiant de l'événement doit être une chaîne de caractères",
    }).refine((val) => Types.ObjectId.isValid(val), {
      message: "Identifiant d'événement non valide",
    }),
  }),
});

export type GetCoupons = z.infer<typeof getCouponsSchema>;

export const registerCouponSchema = object({
  body: object({
    event: string({
      required_error: "L'Identifiant de l'événement est requis",
      invalid_type_error:
        "L'Identifiant de l'événement doit être une chaîne de caractères",
    }).refine((val) => Types.ObjectId.isValid(val), {
      message: "Identifiant d'événement non valide",
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

export type RegisterCoupon = z.infer<typeof registerCouponSchema>;
