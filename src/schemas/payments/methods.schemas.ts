import { number, object, string, z } from "zod";

export const registerPaymentMethodSchema = object({
  body: object({
    paymentMethodId: string({
      required_error: "La référence du moyen de paiement est requis",
    }),
    card: object(
      {
        brand: string({ required_error: "La marque de la carte est requise" }),
        country: string({ required_error: "Le pays de la carte est requise" }),
        expMonth: number({
          required_error: "Le mois d'expiration de la carte est requise",
        }),
        expYear: number({
          required_error: "L'année d'expiration de la carte est requise",
        }),
        last4: number({
          required_error: "Les 4 derniers chiffres de la carte sont requis",
        }),
      },
      { required_error: "Les informations sur la carte sont requises" }
    ),
  }),
});

export type RegisterPaymentMethod = z.infer<typeof registerPaymentMethodSchema>;
