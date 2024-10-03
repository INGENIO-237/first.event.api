import {
  object,
  string,
  date,
  number,
  boolean,
  array,
  nativeEnum,
  z,
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
      coerce: true
    }),
    endDate: date({
      invalid_type_error: "La date de fin doit être une date valide",
    }).optional(),
    eventType: nativeEnum(EVENT_TYPE, {
      required_error: "Le type d'événement est requis",
      invalid_type_error: "Le type d'événement doit être une valeur valide",
    }),
    eventLink: string().optional(),
    location: object({
      geo: object({
        lat: number({
          required_error: "La latitude est requise",
          invalid_type_error: "La latitude doit être un nombre",
        }),
        lng: number({
          required_error: "La longitude est requise",
          invalid_type_error: "La longitude doit être un nombre",
        }),
      }),
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
      .optional()
      .refine((data) => !data || (data.geo && data.geo.lat && data.geo.lng), {
        message:
          "Les coordonnées géographiques sont requises lorsque l'emplacement est fourni",
        path: ["location", "geo"],
      }),
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
    }).optional(),
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
  })
});

export type CreateEvent = z.infer<typeof createEventSchema>;

export type CreateEventPayload = CreateEvent["body"] & {
  image: Image;
  organizer: string;
};

const updateEventSchema = object({
  body: createEventSchema.shape.body.partial(),
  params: object({
    eventId: string({
      required_error: "L'identifiant de l'événement est requis",
      invalid_type_error:
        "L'identifiant de l'événement doit être une chaîne de caractères",
    }),
  }),
});

export type UpdateEvent = z.infer<typeof updateEventSchema>;
