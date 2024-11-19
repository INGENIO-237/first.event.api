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
    location: object({
      city: string({
        required_error: "La ville est requise",
        invalid_type_error: "La ville doit être une chaîne de caractères",
      }),
      country: string({
        required_error: "Le pays est requis",
        invalid_type_error: "Le pays doit être une chaîne de caractères",
      }),
      state: string({
        required_error: "L'état est requis",
        invalid_type_error: "L'état doit être une chaîne de caractères",
      }),
    }),
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
    location: optional(
      object({
        city: string({
          required_error: "La ville est requise",
          invalid_type_error: "La ville doit être une chaîne de caractères",
        }),
        country: string({
          required_error: "Le pays est requis",
          invalid_type_error: "Le pays doit être une chaîne de caractères",
        }),
        state: string({
          required_error: "L'état est requis",
          invalid_type_error: "L'état doit être une chaîne de caractères",
        }),
      })
    ),
    socialMedia: object({
      facebook: optional(
        string({
          invalid_type_error:
            "Le lien Facebook doit être une chaîne de caractères",
        }).url("Le lien Facebook doit être une URL valide")
      ),
      instagram: optional(
        string({
          invalid_type_error:
            "Le lien Instagram doit être une chaîne de caractères",
        }).url("Le lien Instagram doit être une URL valide")
      ),
      twitter: optional(
        string({
          invalid_type_error:
            "Le lien Twitter doit être une chaîne de caractères",
        }).url("Le lien Twitter doit être une URL valide")
      ),
      linkedin: optional(
        string({
          invalid_type_error:
            "Le lien LinkedIn doit être une chaîne de caractères",
        }).url("Le lien LinkedIn doit être une URL valide")
      ),
      youtube: optional(
        string({
          invalid_type_error:
            "Le lien YouTube doit être une chaîne de caractères",
        }).url("Le lien YouTube doit être une URL valide")
      ),
      tiktok: optional(
        string({
          invalid_type_error:
            "Le lien TikTok doit être une chaîne de caractères",
        }).url("Le lien TikTok doit être une URL valide")
      ),
      other: optional(
        string({
          invalid_type_error:
            "Le lien autre doit être une chaîne de caractères",
        }).url("Le lien autre doit être une URL valide")
      ),
    }).optional(),
  }),
});

export type UpdateInfluencer = z.infer<typeof updateInfluencerSchema>;

export type UpdateInfluencerPayload = UpdateInfluencer["body"] & {
  connectedAccount?: string;
  connectedAccountCompleted?: boolean;
  accountCompletionLink?: string;
  accountLinkExpiresAt?: Date;
};
