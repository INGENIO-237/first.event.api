import { array, number, object, optional, string, z } from "zod";

export const registerInfluencerSchema = object({
  body: object({
    experience: string({
      required_error: "L'expérience est requise",
      invalid_type_error: "L'expérience doit être une chaîne de caractères",
    }),
    pastEvents: string({
      required_error: "Le nombre d'événements passés est requis",
      invalid_type_error:
        "L'information sur les événements passés doit être une chaîne de caractères",
    }),
    approximatePeople: string({
      required_error:
        "L'information sur le nombre de personnes touchés est requis",
      invalid_type_error:
        "L'information sur le nombre de personnes touchés doit être une chaîne de caractères",
    }),
    channels: optional(
      array(
        object({
          name: string({
            required_error: "Le nom du canal est requis",
            invalid_type_error:
              "Le nom du canal doit être une chaîne de caractères",
          }),
          link: string({
            required_error: "Le link du canal est requis",
            invalid_type_error:
              "Le link du canal doit être une chaîne de caractères",
          }),
          followers: number({
            required_error: "Le nombre de followers est requis",
            invalid_type_error: "Le nombre de followers doit être un nombre",
          }),
        })
      )
    ),
  }),
});

export type RegisterInfluencer = z.infer<typeof registerInfluencerSchema>;

export const updateInfluencerSchema = object({
  body: object({
    experience: optional(
      string({
        invalid_type_error: "L'expérience doit être une chaîne de caractères",
      })
    ),
    pastEvents: optional(
      string({
        invalid_type_error:
          "L'information sur les événements passés doit être une chaîne de caractères",
      })
    ),
    approximatePeople: optional(
      string({
        invalid_type_error:
          "L'information sur le nombre de personnes touchés doit être une chaîne de caractères",
      })
    ),
    channels: optional(
      array(
        object({
          name: string({
            required_error: "Le nom du canal est requis",
            invalid_type_error:
              "Le nom du canal doit être une chaîne de caractères",
          }),
          link: string({
            required_error: "Le link du canal est requis",
            invalid_type_error:
              "Le link du canal doit être une chaîne de caractères",
          }),
          followers: number({
            required_error: "Le nombre de followers est requis",
            invalid_type_error: "Le nombre de followers doit être un nombre",
          }),
        })
      )
    ),
  }),
});

export type UpdateInfluencer = z.infer<typeof updateInfluencerSchema>;
