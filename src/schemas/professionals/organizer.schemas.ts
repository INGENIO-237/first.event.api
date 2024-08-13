import { array, object, string, z } from "zod";

export const registerOrganizerSchema = object({
  body: object({
    experience: string({
      required_error: "L'expérience est requise",
      invalid_type_error: "L'expérience doit être une chaîne de caractères",
    }),
    pastTeam: string({
      required_error: "La taille de l'équipe est requise",
      invalid_type_error:
        "La taille de l'équipe doit être une chaîne de caractères",
    }),
    targetYearlyEvents: string({
      required_error: "Le nombre d'événements annuel est requis",
      invalid_type_error:
        "Le nombre d'événements annuel doit être une chaîne de caractères",
    }),
    participationEvaluation: string({
      required_error: "L'ampleur des événements est requis",
      invalid_type_error:
        "L'ampleur des événements doit être une chaîne de caractères",
    }),
    goals: array(string(), {
      required_error: "La liste de vos objectifs est requise",
      invalid_type_error:
        "La liste de vos objectifs doit être un tableau de chaînes de caractères",
    }).min(1, "Au moins un objectif est requis"),
  }),
});

export type RegisterOrganizer = z.infer<typeof registerOrganizerSchema>;
