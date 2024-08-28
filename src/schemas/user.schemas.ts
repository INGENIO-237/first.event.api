import { array, boolean, nativeEnum, object, optional, string, z } from "zod";
import isValidPhoneNumber from "../utils/phone";

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
      object({
        home: optional(string()),
        mobile: optional(string()),
      })
    ),
  }).superRefine((data, ctx) => {
    if (data.phones) {
      const { home, mobile } = data.phones;

      if (!isValidPhoneNumber(home as string))
        ctx.addIssue({
          code: z.ZodIssueCode.custom,
          message: "Le format du numéro de téléphone fixe n'est pas valide",
        });
      if (!isValidPhoneNumber(mobile as string))
        ctx.addIssue({
          code: z.ZodIssueCode.custom,
          message: "Le format du numéro de téléphone portable n'est pas valide",
        });
    }
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

export const updateInterestsSchema = object({
  body: object({
    interests: array(
      object({
        interest: string({
          required_error: "Le nom du centre d'intérêt est requis",
          invalid_type_error:
            "Le centre d'intérêt doit être une chaîne de caractères",
        }),
        tags: array(
          string({
            required_error: "Au moins un sous-élément de l'intérêt est requis",
            invalid_type_error:
              "Le sous-élément de l'intérêt doit être une chaîne de caractères",
          }),
          {
            required_error: "Les sous-éléments de l'intérêt sont requis",
            invalid_type_error:
              "Les sous-éléments de l'intérêt doivent être un tableau de chaînes de caractères",
          }
        ),
      }).superRefine((data, ctx) => {
        if (data.interest && data.tags.length < 1) {
          ctx.addIssue({
            code: z.ZodIssueCode.custom,
            message: "Au moins un sous-élément de l'intérêt est requis",
          });
        }
      }),
      {
        required_error: "Les intérêts doivent être renseignées",
        invalid_type_error: "Les intérêts doivent être un tableau d'intérêts",
      }
    ),
  }),
});

export type UpdateInterests = z.infer<typeof updateInterestsSchema>;

export const updateAddressesSchema = object({
  body: object({
    home: object(
      {
        address: string({
          required_error: "L'adresse du domicile est requise",
          invalid_type_error:
            "L'adresse du domicile doit être une chaîne de caractères",
        }),
        country: string({
          required_error: "Le pays du domicile est requis",
          invalid_type_error:
            "Le pays du domicile doit être une chaîne de caractères",
        }),
        state: string({
          required_error: "La région du domicile est requise",
          invalid_type_error:
            "La région du domicile doit être une chaîne de caractères",
        }),
        city: string({
          required_error: "La ville du domicile est requise",
          invalid_type_error:
            "La ville du domicile doit être une chaîne de caractères",
        }),
        zipCode: string({
          required_error: "Le code postal du domicile est requis",
          invalid_type_error:
            "Le code postal du domicile doit être une chaîne de caractères",
        }),
      },
      {
        required_error: "Le domicile est requis",
        invalid_type_error: "Le domicile doit être sous format d'adresse",
      }
    ),
    addresses: object(
      {
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
            sameAsHome: boolean({
              required_error: "Pareille que l'adresse du domicile?",
              invalid_type_error:
                "'Pareille que l'adresse du domicile' doit être un booléen",
            }),
          },
          {
            required_error: "L'adresse de facturation est requise",
            invalid_type_error:
              "L'adresse de facturation doit être une adresse valide",
          }
        ).superRefine((data, ctx) => {
          // Either same as home or different
          if (data.content && data.sameAsHome) {
            ctx.addIssue({
              code: z.ZodIssueCode.custom,
              message:
                "Addresse de facturation invalide. Soit c'est la même chose que l'adresse du domicile soit c'est différent. Mais pas les deux en même temps",
            });
          }
          if (!data.content && !data.sameAsHome) {
            ctx.addIssue({
              code: z.ZodIssueCode.custom,
              message:
                "Addresse de facturation invalide. Soit c'est la même chose que l'adresse du domicile soit il faut fournir une adresse différente",
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
            sameAsHome: boolean({
              required_error: "Pareille que l'adresse du domicile?",
              invalid_type_error:
                "'Pareille que l'adresse du domicile' doit être un booléen",
            }),
          },
          {
            required_error: "L'adresse de livraison est requise",
            invalid_type_error:
              "L'adresse de livraison est requise doit être une adresse valide",
          }
        ).superRefine((data, ctx) => {
          // Either same as home or different
          if (data.content && data.sameAsHome) {
            ctx.addIssue({
              code: z.ZodIssueCode.custom,
              message:
                "Addresse de livraison invalide. Soit c'est la même chose que l'adresse du domicile soit c'est différent. Mais pas les deux en même temps",
            });
          }
          if (!data.content && !data.sameAsHome) {
            ctx.addIssue({
              code: z.ZodIssueCode.custom,
              message:
                "Addresse de livraison invalide. Soit c'est la même chose que l'adresse du domicile soit il faut fournir une adresse différente",
            });
          }
        }),
      },
      {
        required_error: "Les autres adresses sont requises",
        invalid_type_error:
          "Les autres adresses doivent être sous forme de tableau d'adresses",
      }
    ),
  }),
});

export type UpdateAddresses = z.infer<typeof updateAddressesSchema>;
