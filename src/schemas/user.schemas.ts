import { array, nativeEnum, object, optional, string, z } from "zod";
import { PHONE_TYPE } from "../utils/constants/user.utils";

export const registerUserSchema = object({
  body: object({
    email: string({ required_error: "L'adresse mail est requise" }).email(
      "Email invalide"
    ),
    firstname: string({
      required_error: "Le prénom est requis",
      invalid_type_error: "Le prénom doit être une chaîne de caractères",
    }),
    lastname: string({
      required_error: "Le nom est requis",
      invalid_type_error: "Le nom doit être une chaîne de caractères",
    }),
    password: string({
      required_error: "Le mot de passe est requis",
      invalid_type_error: "Le mot de passe doit être une chaîne de caractères",
    }).min(6, "Le mot de passe doit contenir au moins 6 caractères"),
  }),
});

export type RegisterUser = z.infer<typeof registerUserSchema>;

export const updateGeneralInfoSchema = object({
  body: object({
    firstname: optional(
      string({
        invalid_type_error: "Le prénom doit être une chaîne de caractères",
      })
    ),
    lastname: optional(
      string({
        invalid_type_error: "Le nom doit être une chaîne de caractères",
      })
    ),
    phones: optional(
      array(
        object({
          cat: nativeEnum(PHONE_TYPE, {
            required_error: "La catégorie est requise",
            invalid_type_error: "La catégorie doit être soit HOME soit MOBILE",
          }),
          value: string({
            required_error: "La valeur du numéro de téléphone est requise",
          }),
        })
      )
    ),
  }),
});

export type GeneralInfo = z.infer<typeof updateGeneralInfoSchema>;

export type UpdateGeneralInfo = GeneralInfo["body"] & {
  image?: { url: string; publicId: string };
};

export const updateCredentialsSchema = object({
  body: object({
    email: string({ required_error: "L'adresse mail est requise" }).email(
      "Email invalide"
    ),
    oldPassword: string({
      required_error: "L'ancien mot de passe est requis",
      invalid_type_error:
        "L'ancien mot de passe doit être une chaîne de caractères",
    }).min(6, "L'ancien mot de passe doit contenir au moins 6 caractères"),
    password: string({
      required_error: "Le mot de passe est requis",
      invalid_type_error: "Le mot de passe doit être une chaîne de caractères",
    }).min(6, "Le mot de passe doit contenir au moins 6 caractères"),
  }).superRefine((data, ctx) => {
    const { oldPassword, password } = data;

    if (oldPassword == password) {
      ctx.addIssue({
        code: z.ZodIssueCode.custom,
        message:
          "Le nouveau mot de passe doit être différent de l'ancien mot de passe",
      });
    }
  }),
});

export type UpdateCredentials = z.infer<typeof updateCredentialsSchema>;
