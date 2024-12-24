import { Types } from "mongoose";
import { nativeEnum, number, object, string, z } from "zod";
import { Image, PRODUCT_STATUS } from "../../utils/constants/common";

export const getProductsSchema = object({
  query: object({
    event: string()
      .optional()
      .refine(
        (data) => {
          if (!data) return true;

          return Types.ObjectId.isValid(data);
        },
        {
          message: "L'identifiant de l'événement n'est pas valide",
        }
      ),
    organizer: string({
      invalid_type_error:
        "L'identifiant de l'organisateur doit être une chaîne de caractères",
    })
      .optional()
      .refine(
        (data) => {
          if (!data) return true;

          return Types.ObjectId.isValid(data);
        },
        {
          message: "L'identifiant de l'organisateur n'est pas valide",
        }
      ),
  }).optional(),
});

export type GetProductsQuery = z.infer<typeof getProductsSchema>["query"];

export const createProductSchema = object({
  body: object({
    title: string({
      required_error: "Le titre de l'article est requis",
      invalid_type_error: "Le titre doit être une chaîne de caractères",
    }),
    price: string({
      required_error: "Le prix de l'article est requis",
    }).refine(
      (data) => {
        if (Number.isNaN(Number(data))) return false;

        return true;
      },
      {
        message: "Le prix doit être un nombre",
      }
    ),
    event: string({
      invalid_type_error:
        "L'identifiant de l'événement doit être une chaîne de caractères",
    })
      .optional()
      .refine(
        (data) => {
          if (!data) return true;

          return Types.ObjectId.isValid(data);
        },
        {
          message: "L'identifiant de l'événement n'est pas valide",
        }
      ),
    description: string({
      invalid_type_error: "La description doit être une chaîne de caractères",
    }).optional(),
  }),
});

export type CreateProductInput = z.infer<typeof createProductSchema>;
export type CreateProductPayload = CreateProductInput["body"] & {
  organizer: string;
  image: Image;
};

export const updateProductSchema = object({
  params: object({
    product: string({
      required_error: "L'identifiant de l'article est requis",
      invalid_type_error: "L'identifiant doit être une chaîne de caractères",
    }).refine(
      (data) => {
        return Types.ObjectId.isValid(data);
      },
      {
        message: "L'identifiant n'est pas valide",
      }
    ),
  }),
  body: object({
    title: string({
      invalid_type_error: "Le titre doit être une chaîne de caractères",
    }).optional(),
    price: string({
      required_error: "Le prix de l'article est requis",
    })
      .optional()
      .refine(
        (data) => {
          if (Number.isNaN(Number(data))) return false;

          return true;
        },
        {
          message: "Le prix doit être un nombre",
        }
      ),
    event: string({
      invalid_type_error:
        "L'identifiant de l'événement doit être une chaîne de caractères",
    })
      .optional()
      .refine(
        (data) => {
          if (!data) return true;

          return Types.ObjectId.isValid(data);
        },
        {
          message: "L'identifiant de l'événement n'est pas valide",
        }
      ),
    description: string({
      invalid_type_error: "La description doit être une chaîne de caractères",
    }).optional(),
    status: nativeEnum(PRODUCT_STATUS, {
      invalid_type_error:
        "Le status doit être une chaîne de caractères. Soit 'available' ou 'unavailable'",
    }).optional(),
  }),
});

export type UpdateProductInput = z.infer<typeof updateProductSchema>;
