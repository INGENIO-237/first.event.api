import { Types } from "mongoose";
import { number, object, string, z } from "zod";

export const createInfluencerReviewSchema = object({
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
    influencer: string({
      required_error: "L'organisateur est requis",
      invalid_type_error: "L'organisateur doit être une chaîne de caractères",
    }).refine((data) => Types.ObjectId.isValid(data), {
      message: "L'organisateur doit être une chaîne de caractères valide",
    }),
  }),
});

export type CreateInfluencerReviewInput = z.infer<
  typeof createInfluencerReviewSchema
>;

export type CreateInfluencerReviewPayload =
  CreateInfluencerReviewInput["body"] & {
    user: string;
  };

export const getInfluencerReviewsSchema = object({
  query: object({
    influencer: string({
      required_error: "L'organisateur est requis",
      invalid_type_error: "L'organisateur doit être une chaîne de caractères",
    }),
  }),
});

export type GetInfluencerReviewsInput = z.infer<
  typeof getInfluencerReviewsSchema
>;
