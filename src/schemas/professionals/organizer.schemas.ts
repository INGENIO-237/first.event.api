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
  }),
});

export type UpdateOrganizer = z.infer<typeof updateOrganizerSchema>;
