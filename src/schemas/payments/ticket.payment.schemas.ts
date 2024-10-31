import { Types } from "mongoose";
import { array, object, string, z } from "zod";
import { DiscountedCoupon } from "../../utils/constants/common";

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
    coupons: array(
      string({
        required_error: "Le code du coupon est requis",
        invalid_type_error:
          "Le code du coupon doit être une chaîne de caractères",
      })
    )
      .optional()
      .refine(
        (data) => {
          if (!data) return true;

          return data.length > 0;
        },
        {
          message: "Au moins un coupon est requis",
          path: ["coupons"],
        }
      ),
  }),
});

export type CreateTicketPaymentInput = z.infer<
  typeof createTicketPaymentSchema
>;
export type CreateTicketPaymentPayload = CreateTicketPaymentInput["body"] & {
  user: string;
};

export type TicketPaymentPayload = {
  user: string;
  paymentIntent: string;
  amount: number;
  fees: number;
  coupons?: DiscountedCoupon[];
  ticketOrder: string;
};
