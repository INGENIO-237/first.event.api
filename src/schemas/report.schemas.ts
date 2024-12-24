import { Types } from "mongoose";
import { date, object, string, z } from "zod";
import { REPORT_STATUS } from "../utils/constants/common";

export const createReportSchema = object({
  body: object({
    reason: string({
      required_error: "La raison est requise",
    }),
    description: string({
      required_error: "La description est requise",
    }),
    product: string()
      .optional()
      .refine(
        (data) => {
          if (data) return Types.ObjectId.isValid(data);

          return true;
        },
        {
          message: "L'identifiant du produit n'est pas valide",
          path: ["product"],
        }
      ),
    target: string()
      .optional()
      .refine(
        (data) => {
          if (data) return Types.ObjectId.isValid(data);

          return true;
        },
        {
          message: "L'identifiant de l'utilisateur n'est pas valide",
          path: ["target"],
        }
      ),
    event: string()
      .optional()
      .refine(
        (data) => {
          if (data) return Types.ObjectId.isValid(data);

          return true;
        },
        {
          message: "L'identifiant de l'événement n'est pas valide",
          path: ["event"],
        }
      ),
  }).refine(
    (data) => {
      if (!data.product && !data.target && !data.event) {
        return false;
      }
      return true;
    },
    {
      message:
        "Vous devez spécifier un produit, un utilisateur ou un événement",
      path: ["product", "target", "event"],
    }
  ),
});

export type CreateReport = z.infer<typeof createReportSchema>;
export type CreateReportPayload = CreateReport["body"] & {
  user: string;
};

export const getReportsSchema = object({
  query: object({
    status: string()
      .optional()
      .refine(
        (data) => {
          return data
            ? Object.values(REPORT_STATUS).includes(data as REPORT_STATUS)
            : true;
        },
        {
          message: "Le statut n'est pas valide",
          path: ["status"],
        }
      ),
    page: string()
      .optional()
      .refine(
        (data) => {
          if (data) return !isNaN(Number(data));

          return true;
        },
        {
          message: "La page n'est pas valide",
          path: ["page"],
        }
      ),
    limit: string()
      .optional()
      .refine(
        (data) => {
          if (data) return !isNaN(Number(data));

          return true;
        },
        {
          message: "La limite n'est pas valide",
          path: ["limit"],
        }
      ),
    from: string()
      .date()
      .optional()
      .refine(
        (data) => {
          if (data) return !isNaN(new Date(data).getTime());

          return true;
        },
        {
          message: "La date de début n'est pas valide",
          path: ["from"],
        }
      ),
    to: string()
      .date()
      .optional()
      .refine(
        (data) => {
          if (data) return !isNaN(new Date(data).getTime());

          return true;
        },
        {
          message: "La date de fin n'est pas valide",
          path: ["to"],
        }
      ),
  }),
});

export type GetReports = z.infer<typeof getReportsSchema>;

export const updateReportSchema = object({
  body: object({
    status: string()
      .optional()
      .refine(
        (data) => {
          return data
            ? Object.values(REPORT_STATUS).includes(data as REPORT_STATUS)
            : true;
        },
        {
          message: "Le statut n'est pas valide",
          path: ["status"],
        }
      ),
  }),
  params: object({
    report: string({
      required_error: "L'identifiant est requis",
    }).refine(
      (data) => {
        return Types.ObjectId.isValid(data);
      },
      {
        message: "L'identifiant n'est pas valide",
        path: ["id"],
      }
    ),
  }),
});

export type UpdateReport = z.infer<typeof updateReportSchema>;
