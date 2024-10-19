import { Types } from "mongoose";
import { object, string, z } from "zod";

export const createTicketPaymentSchema = object({
  body: object({
    ticketOrder: string({
      required_error: "L'identifiant de la commande est requis",
      invalid_type_error:
        "L'identifiant de la commande doit être une chaîne de caractères",
    }).refine((data) => Types.ObjectId.isValid(data), {
      message: "L'identifiant de la commande n'est pas valide",
      path: ["ticketOrder"],
    }),
    paymentMethodId: string({
      invalid_type_error:
        "L'identifiant du mode de paiement doit être une chaîne de caractères",
    }).optional(),
  }),
});

export type CreateTicketPaymentInput = z.infer<
  typeof createTicketPaymentSchema
>;
export type CreateTicketPaymentPayload = CreateTicketPaymentInput["body"] & {
  user: string;
};
