import { Types } from "mongoose";
import { number, object, string, z } from "zod";

export const addCartItemSchema = object({
  body: object({
    product: string({
      required_error: "L'identifiant du produit est requis",
      invalid_type_error:
        "L'identifiant du produit doit être une chaîne de caractères",
    }).refine((data) => Types.ObjectId.isValid(data), {
      message: "L'identifiant du produit est invalide",
      path: ["product"],
    }),
    quantity: number({
      required_error: "La quantité est requise",
      invalid_type_error: "La quantité doit être un nombre",
    })
      .int({
        message: "La quantité doit être un entier",
      })
      .min(1, {
        message: "La quantité doit être supérieure ou égale à 1",
      })
      .max(100, {
        message: "La quantité doit être inférieure ou égale à 100",
      })
      .transform((data) => Number(data)),
  }),
});

export type AddCartItem = z.infer<typeof addCartItemSchema>;

export const removeCartItemSchema = object({
  params: object({
    product: string({
      required_error: "L'identifiant du produit est requis",
      invalid_type_error:
        "L'identifiant du produit doit être une chaîne de caractères",
    }).refine((data) => Types.ObjectId.isValid(data), {
      message: "L'identifiant du produit est invalide",
      path: ["product"],
    }),
  }),
});

export type RemoveCartItem = z.infer<typeof removeCartItemSchema>;
