import { Types } from "mongoose";
import { nativeEnum, number, object, string, z } from "zod";
import { ORDER_PAYMENT_TYPE, ORDER_TYPE } from "../../utils/constants/common";

const registerGainSchema = object({
  body: object({
    amount: number({
      required_error: "Le montant est requis",
      invalid_type_error: "Le montant doit être un nombre",
    }),
    coupon: string({
      required_error: "Le coupon de reduction est requis",
      invalid_type_error: "Le coupon doit être une chaîne de caractères",
    }),
    influencer: string({
      required_error: "L'identifiant de l'influenceur est requis",
      invalid_type_error:
        "L'identifiant de l'influenceur doit être une chaîne de caractères",
    }).refine((data) => Types.ObjectId.isValid(data), {
      message: "L'identifiant de l'influenceur n'est pas valide",
    }),
    orderType: nativeEnum(ORDER_TYPE, {
      required_error: "Le type de commande est requis",
      invalid_type_error: "Le type de commande n'est pas valide",
    }),
    order: string({
      required_error: "L'identifiant de la commande est requis",
      invalid_type_error:
        "L'identifiant de la commande doit être une chaîne de caractères",
    }).refine((data) => Types.ObjectId.isValid(data), {
      message: "L'identifiant de la commande n'est pas valide",
    }),
    paymentType: nativeEnum(ORDER_PAYMENT_TYPE, {
      required_error: "Le type de paiement est requis",
      invalid_type_error: "Le type de paiement n'est pas valide",
    }),
    payment: string({
      required_error: "L'identifiant du paiement est requis",
      invalid_type_error:
        "L'identifiant du paiement doit être une chaîne de caractères",
    }).refine((data) => Types.ObjectId.isValid(data), {
      message: "L'identifiant du paiement n'est pas valide",
    }),
  }),
});

export type RegisterGain = z.infer<typeof registerGainSchema>;
