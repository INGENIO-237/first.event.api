import {
  object,
  string,
  date,
  number,
  boolean,
  array,
  nativeEnum,
  z,
  optional,
} from "zod";
import {
  EVENT_STATUS,
  EVENT_TYPE,
  TAX_POLICY,
} from "../../utils/constants/events";
import { Image } from "../../utils/constants/common";

export const createEventSchema = object({
  body: object({
    title: string({
      required_error: "Le titre est requis",
      invalid_type_error: "Le titre doit être une chaîne de caractères",
    }),
    video: string().optional(),
    description: string({
      required_error: "La description est requise",
      invalid_type_error: "La description doit être une chaîne de caractères",
    }),
    startDate: date({
      required_error: "La date de début est requise",
      invalid_type_error: "La date de début doit être une date valide",
      coerce: true,
    }).refine((data) => {
      const time = data.getTime();
      const present = new Date().getTime();

      return time > present;
    }, "La date de début doit être une date future"),
    endDate: date({
      invalid_type_error: "La date de fin doit être une date valide",
      coerce: true,
    })
      .optional()
      .refine((data) => {
        if (data) {
          const time = data.getTime();
          const present = new Date().getTime();

          return time > present;
        }

        return true;
      }, "La date de fin doit être une date future"),
    eventType: nativeEnum(EVENT_TYPE, {
      required_error: "Le type d'événement est requis",
      invalid_type_error: "Le type d'événement doit être une valeur valide",
    }),
    eventLink: string().optional(),
    location: optional(
      object({
        geo: object(
          {
            lat: number({
              required_error: "La latitude est requise",
              invalid_type_error: "La latitude doit être un nombre",
            }),
            lng: number({
              required_error: "La longitude est requise",
              invalid_type_error: "La longitude doit être un nombre",
            }),
          },
          {
            required_error: "Les coordonnées géographiques sont requises",
            invalid_type_error:
              "Les coordonnées géographiques doivent être un objet valide",
          }
        ),
        address: string({
          required_error: "L'adresse est requise",
          invalid_type_error: "L'adresse doit être une chaîne de caractères",
        }),
        city: string({
          required_error: "La ville est requise",
          invalid_type_error: "La ville doit être une chaîne de caractères",
        }),
        state: string({
          required_error: "L'état est requis",
          invalid_type_error: "L'état doit être une chaîne de caractères",
        }),
        country: string({
          required_error: "Le pays est requis",
          invalid_type_error: "Le pays doit être une chaîne de caractères",
        }),
      })
    ),
    category: string({
      required_error: "La catégorie est requise",
      invalid_type_error: "La catégorie doit être une chaîne de caractères",
    }),
    tags: array(string()).optional(),
    isFree: boolean({
      invalid_type_error: "isFree doit être un booléen",
    }).default(false),
    taxPolicy: nativeEnum(TAX_POLICY, {
      invalid_type_error: "La politique fiscale doit être une valeur valide",
    })
      .optional()
      .default(TAX_POLICY.ABSORB),
    tickets: array(
      object({
        cat: string({
          required_error: "La catégorie du billet est requise",
          invalid_type_error:
            "La catégorie du billet doit être une chaîne de caractères",
        }),
        price: number({
          required_error: "Le prix du billet est requis",
          invalid_type_error: "Le prix du billet doit être un nombre",
        }),
        quantity: number({
          required_error: "La quantité de billets est requise",
          invalid_type_error: "La quantité de billets doit être un nombre",
        }),
      }),
      {
        required_error: "Au moins un billet est requis",
        invalid_type_error:
          "Les billets doivent être un tableau d'objets valides",
      }
    ),
    status: nativeEnum(EVENT_STATUS, {
      invalid_type_error: "Le statut doit être une valeur valide",
    }).default(EVENT_STATUS.DRAFT),
  }).superRefine((data, ctx) => {
    if (data.endDate && data.endDate < data.startDate) {
      ctx.addIssue({
        code: z.ZodIssueCode.custom,
        message: "La date de fin doit être supérieure à la date de début",
        path: ["endDate"],
      });
    }

    if (data.eventType == EVENT_TYPE.ONLINE && !data.eventLink) {
      ctx.addIssue({
        code: z.ZodIssueCode.custom,
        message: "Le lien de l'événement en ligne est requis",
        path: ["eventLink"],
      });
    }

    if (data.eventType == EVENT_TYPE.ONSITE && !data.location) {
      ctx.addIssue({
        code: z.ZodIssueCode.custom,
        message: "L'emplacement de l'événement est requis",
        path: ["location"],
      });
    }
  }),
});

export type CreateEvent = z.infer<typeof createEventSchema>;

export type CreateEventPayload = CreateEvent["body"] & {
  image: Image;
  organizer: string;
};

export const updateEventSchema = object({
  body: object({
    title: string({
      invalid_type_error: "Le titre doit être une chaîne de caractères",
    }).optional(),

    video: string().optional(),

    description: string({
      invalid_type_error: "La description doit être une chaîne de caractères",
    }).optional(),

    startDate: date({
      invalid_type_error: "La date de début doit être une date valide",
      coerce: true,
    })
      .optional()
      .refine((data) => {
        if (data) {
          const time = data.getTime();
          const present = new Date().getTime();
          return time > present;
        }
        return true;
      }, "La date de début doit être une date future"),

    endDate: date({
      invalid_type_error: "La date de fin doit être une date valide",
      coerce: true,
    })
      .optional()
      .refine((data) => {
        if (data) {
          const time = data.getTime();
          const present = new Date().getTime();
          return time > present;
        }
        return true;
      }, "La date de fin doit être une date future"),

    eventType: nativeEnum(EVENT_TYPE, {
      invalid_type_error: "Le type d'événement doit être une valeur valide",
    }).optional(),

    eventLink: string().optional(),

    location: z
      .object({
        geo: object({
          lat: number({
            invalid_type_error: "La latitude doit être un nombre",
          }),
          lng: number({
            invalid_type_error: "La longitude doit être un nombre",
          }),
        }).optional(),
        address: string({
          invalid_type_error: "L'adresse doit être une chaîne de caractères",
        }).optional(),
        city: string({
          invalid_type_error: "La ville doit être une chaîne de caractères",
        }).optional(),
        state: string({
          invalid_type_error: "L'état doit être une chaîne de caractères",
        }).optional(),
        country: string({
          invalid_type_error: "Le pays doit être une chaîne de caractères",
        }).optional(),
      })
      .optional(),

    category: string({
      invalid_type_error: "La catégorie doit être une chaîne de caractères",
    }).optional(),

    tags: array(string()).optional(),

    isFree: boolean({
      invalid_type_error: "isFree doit être un booléen",
    }).optional(),

    taxPolicy: nativeEnum(TAX_POLICY, {
      invalid_type_error: "La politique fiscale doit être une valeur valide",
    }).optional(),

    tickets: z
      .array(
        object({
          cat: string({
            invalid_type_error:
              "La catégorie du billet doit être une chaîne de caractères",
          }).optional(),
          price: number({
            invalid_type_error: "Le prix du billet doit être un nombre",
          }).optional(),
          quantity: number({
            invalid_type_error: "La quantité de billets doit être un nombre",
          }).optional(),
        })
      )
      .optional(),

    status: nativeEnum(EVENT_STATUS, {
      invalid_type_error: "Le statut doit être une valeur valide",
    }).optional(),
  }).superRefine((data, ctx) => {
    if (data.endDate && data.startDate && data.endDate < data.startDate) {
      ctx.addIssue({
        code: z.ZodIssueCode.custom,
        message: "La date de fin doit être supérieure à la date de début",
        path: ["endDate"],
      });
    }

    if (data.eventType === EVENT_TYPE.ONLINE && !data.eventLink) {
      ctx.addIssue({
        code: z.ZodIssueCode.custom,
        message: "Le lien de l'événement en ligne est requis",
        path: ["eventLink"],
      });
    }

    if (data.eventType === EVENT_TYPE.ONSITE && !data.location) {
      ctx.addIssue({
        code: z.ZodIssueCode.custom,
        message: "L'emplacement de l'événement est requis",
        path: ["location"],
      });
    }
  }),
  params: object({
    event: string({
      required_error: "L'ID de l'événement est requis",
      invalid_type_error: "L'ID de l'événement doit être une chaîne de caractères",
    }),
  }),
});

export type UpdateEvent = z.infer<typeof updateEventSchema>;

export type UpdateEventPayload = UpdateEvent["body"] & {
  image: Image;
  organizer: string;
};
