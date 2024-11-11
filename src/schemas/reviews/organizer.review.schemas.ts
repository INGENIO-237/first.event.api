import { Types } from "mongoose";
import { number, object, string, z } from "zod";

export const createOrganizerReviewSchema = object({
  body: object({
    rating: number({
      required_error: "Le Rating est requis",
      invalid_type_error: "Le Rating doit être un nombre",
    })
      .max(5, {
        message: "Le Rating doit être inférieur ou égal à 5",
      })
      .min(1, {
        message: "Le Rating doit être supérieur ou égal à 1",
      }),
    comment: string({
      invalid_type_error: "Le commentaire doit être une chaîne de caractères",
    }).optional(),
    organizer: string({
      required_error: "L'organisateur est requis",
      invalid_type_error: "L'organisateur doit être une chaîne de caractères",
    }).refine((data) => Types.ObjectId.isValid(data), {
      message: "L'organisateur doit être une chaîne de caractères valide",
    }),
  }),
});

export type CreateOrganizerReviewInput = z.infer<
  typeof createOrganizerReviewSchema
>;

export type CreateOrganizerReviewPayload =
  CreateOrganizerReviewInput["body"] & {
    user: string;
  };

export const getOrganizerReviewsSchema = object({
  query: object({
    organizer: string({
      required_error: "L'organisateur est requis",
      invalid_type_error: "L'organisateur doit être une chaîne de caractères",
    }),
  }),
});

export type GetOrganizerReviewsInput = z.infer<
  typeof getOrganizerReviewsSchema
>;
