import { Types } from "mongoose";
import { object, string, z } from "zod";

export const createEventBookmarkSchema = object({
  body: object({
    event: string({
      required_error: "L'événement est requis",
    }).refine((data) => Types.ObjectId.isValid(data), {
      message: "L'ID de l'événement est invalide",
    }),
  }),
});

export type CreateEventBookmark = z.infer<typeof createEventBookmarkSchema>;
export type CreateEventBookmarkPayload = CreateEventBookmark["body"] & {
  user: string;
};
