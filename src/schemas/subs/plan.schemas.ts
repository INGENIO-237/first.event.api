import { nativeEnum, number, object, optional, string, z } from "zod";
import {
  ASSISTANCE,
  PLANS,
  TICKETS_PER_EVENT,
} from "../../utils/constants/plans-and-subs";

export const createPlanSchema = object({
  body: object({
    name: nativeEnum(PLANS, {
      required_error: "Le nom du plan tarifaire est requis",
      invalid_type_error:
        "Le plan tarifaire doit être une chaîne de caractères",
    }),
    monthlyPrice: number({
      required_error: "Le prix mensuel est requis",
      invalid_type_error: "Le prix mensuel doit être un nombre",
    }),
    yearlyPrice: number({
      required_error: "Le prix annuel est requis",
      invalid_type_error: "Le prix annuel doit être un nombre",
    }),
    ticketsPerEvent: nativeEnum(TICKETS_PER_EVENT, {
      required_error: "Le nombre de tickets par événement est requis",
      invalid_type_error:
        "Le nombre de tickets doit être compris entre: " +
        Object.values(TICKETS_PER_EVENT).join(", "),
    }),
    assistance: nativeEnum(ASSISTANCE, {
      required_error: "L'assistance est requise",
      invalid_type_error:
        "L'assistance doit être comprise entre: " +
        Object.values(ASSISTANCE).join(", "),
    }),
    couponsPerEvent: string({
      required_error: "Le nombre de coupons par événement est requis",
    }),
    tryDays: number({
      required_error: "Le nombre de jours d'essai est requis",
      invalid_type_error: "Le nombre de jours d'essai doit être un nombre",
    }),
    promotion: optional(
      number({
        invalid_type_error:
          "Le nombre de promotions accordées doit être un nombre",
      })
    ),
  }).superRefine((data, ctx) => {
    if (
      !["Illimité", "ILLIMITE"].includes(data.couponsPerEvent) &&
      Number.isNaN(Number(data.couponsPerEvent))
    ) {
      ctx.addIssue({
        code: z.ZodIssueCode.custom,
        message:
          "Le nombre de coupons par événement doit être soit un nombre soit 'Illimité'",
      });
    }
  }),
});

export type CreatePlan = z.infer<typeof createPlanSchema>;
