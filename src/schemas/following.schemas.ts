import { Types } from "mongoose";
import { object, string, z } from "zod";

export const createFollowingSchema = object({
  body: object({
    organizer: string({
      required_error: "L'identifiant de l'organisateur est requis",
      invalid_type_error:
        "L'identifiant de l'organisateur doit être une chaîne de caractères",
    }).refine((data) => Types.ObjectId.isValid(data), {
      message: "L'identifiant de l'organisateur est invalide",
    }),
  }),
});

export type CreateFollowing = z.infer<typeof createFollowingSchema>;
export type CreateFollowingPayload = CreateFollowing["body"] & {
  user: string;
};

export const getFollowingsSchema = object({
  query: object({
    organizer: string({
      invalid_type_error:
        "L'identifiant de l'organisateur doit être une chaîne de caractères",
    })
      .optional()
      .refine((data) => (data ? Types.ObjectId.isValid(data) : true), {
        message: "L'identifiant de l'organisateur est invalide",
      }),
    user: string({
      invalid_type_error:
        "L'identifiant de l'utilisateur doit être une chaîne de caractères",
    })
      .optional()
      .refine((data) => (data ? Types.ObjectId.isValid(data) : true), {
        message: "L'identifiant de l'utilisateur est invalide",
      }),
  }),
});

export type GetFollowings = z.infer<typeof getFollowingsSchema>;