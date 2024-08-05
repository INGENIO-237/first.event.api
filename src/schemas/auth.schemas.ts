import { number, object, optional, string, z } from "zod";

export const loginSchema = object({
  body: object({
    email: string({ required_error: "L'adresse mail est requise" }).email(
      "Email invalide"
    ),
    password: string({
      required_error: "Le mot de passe est requis",
      invalid_type_error: "Le mot de passe doit être une chaîne de caractères",
    }).min(6, "Le mot de passe doit contenir au moins 6 caractères"),
    otp: optional(
      number({ invalid_type_error: "Le code OTP est invalide" }).min(
        6,
        "Le code OTP doit contenir au moins 6 caractères"
      )
    ),
  }).superRefine((data, ctx) => {
    if (data.otp && String(data.otp).length > 6) {
      ctx.addIssue({
        code: z.ZodIssueCode.custom,
        message: "Le code OTP doit contenir au plus 6 caractères",
      });
    }
  }),
});

export type LoginPayload = z.infer<typeof loginSchema>;

export const resendOtpSchema = object({
  body: object({
    email: string({ required_error: "L'adresse mail est requise" }).email(
      "Email invalide"
    ),
  }),
});

export type ResendOtp = z.infer<typeof resendOtpSchema>;
