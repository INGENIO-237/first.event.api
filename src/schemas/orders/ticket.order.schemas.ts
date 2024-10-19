import { Types } from "mongoose";
import { nativeEnum, number, object, string, z } from "zod";

export const createTicketOrderSchema = object({
  body: object({
    event: string({
      required_error: "L'identifiant de l'événement est requis",
      invalid_type_error:
        "L'identifiant de l'événement doit être une chaîne de caractères",
    }).refine((data) => Types.ObjectId.isValid(data), {
      message: "L'identifiant de l'événement n'est pas valide",
    }),
    tickets: object(
      {
        cat: string(),
        quantity: number(),
        price: number(),
      },
      {
        required_error: "Le type de billet est requis",
        invalid_type_error:
          "Le type de billet doit être une chaîne de caractères",
      }
    ).array(),
  }),
});

export type CreateTicketOrderInput = z.infer<typeof createTicketOrderSchema>;
export type CreateTicketOrderPayload = CreateTicketOrderInput["body"] & {
  user: string;
};

export const updateTicketOrderSchema = object({
  params: object({
    ticketOrder: string({
      required_error: "L'identifiant de la commande est requis",
      invalid_type_error:
        "L'identifiant de la commande doit être une chaîne de caractères",
    }).refine((data) => Types.ObjectId.isValid(data), {
      message: "L'identifiant de la commande n'est pas valide",
    }),
  }),
  body: object({
    tickets: object(
      {
        cat: string(),
        quantity: number(),
        price: number(),
      },
      {
        required_error: "Le type de billet est requis",
        invalid_type_error:
          "Le type de billet doit être une chaîne de caractères",
      }
    )
      .array()
      .optional(),
    // status: nativeEnum()
  }),
});

export type UpdateTicketOrderInput = z.infer<typeof updateTicketOrderSchema>;
