import { array, object, optional, string, z } from "zod";

export const registerOrganizerSchema = object({
  body: object({
    experience: string({
      invalid_type_error: "L'expérience doit être une chaîne de caractères",
    }),
    pastTeam: string({
      invalid_type_error:
        "La taille de l'équipe doit être une chaîne de caractères",
    }),
    targetYearlyEvents: string({
      invalid_type_error:
        "Le nombre d'événements annuel doit être une chaîne de caractères",
    }),
    participationEvaluation: string({
      invalid_type_error:
        "L'ampleur des événements doit être une chaîne de caractères",
    }),
    goals: array(string(), {
      invalid_type_error:
        "La liste de vos objectifs doit être un tableau de chaînes de caractères",
    }).min(1, "Au moins un objectif est requis"),
  }),
});

export type RegisterOrganizer = z.infer<typeof registerOrganizerSchema>;

export const updateOrganizerSchema = object({
  body: object({
    experience: optional(
      string({
        invalid_type_error: "L'expérience doit être une chaîne de caractères",
      })
    ),
    pastTeam: optional(
      string({
        invalid_type_error:
          "La taille de l'équipe doit être une chaîne de caractères",
      })
    ),
    targetYearlyEvents: optional(
      string({
        invalid_type_error:
          "Le nombre d'événements annuel doit être une chaîne de caractères",
      })
    ),
    participationEvaluation: optional(
      string({
        invalid_type_error:
          "L'ampleur des événements doit être une chaîne de caractères",
      })
    ),
    goals: optional(
      array(string(), {
        invalid_type_error:
          "La liste de vos objectifs doit être un tableau de chaînes de caractères",
      }).min(1, "Au moins un objectif est requis")
    ),
    website: optional(
      string({
        invalid_type_error: "Le site web doit être une chaîne de caractères",
      }).url("Le site web doit être une URL valide")
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
    description: optional(
      string({
        invalid_type_error: "La description doit être une chaîne de caractères",
      })
    ),
  }),
});

export type UpdateOrganizer = z.infer<typeof updateOrganizerSchema>;

export type UpdateOrganizerPayload = UpdateOrganizer["body"] & {
  subscription?: string;
  connectedAccount?: string;
  connectedAccountCompleted?: boolean;
  accountCompletionLink?: string;
  accountLinkExpiresAt?: Date;
};
