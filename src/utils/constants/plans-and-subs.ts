import { PAYMENT_TYPE } from "./common";

export enum TICKETS_PER_EVENT {
  ESSENTIAL = 300,
  PROFESSIONAL = 5000,
  PREMIUM = "Illimité",
}

export enum ASSISTANCE {
  BASIC = "Basic",
  PRIORITY = "Prioritaire",
}

export enum PLANS {
  ESSENTIAL = "Essentiel",
  PROFESSIONAL = "Professionnel",
  PREMIUM = "Premium",
}

export enum BILLING_TYPE {
  MONTHLY = "Mensuel",
  YEARLY = "Annuel",
}

export enum PAYMENT_STATUS {
  INITIATED = "Initié",
  SUCCEEDED = "Réussi",
  FAILED = "Echoué",
  EXPIRED = "Expiré",
}

export enum PAYMENT_ACTIONS {
  SUBSCRIPTION_SUCCEEDED = "SUBSCRIPTION_SUCCEEDED",
  REFUND_SUBSCRIPTION = "REFUND_SUBSCRIPTION",
}

export enum SUBS_ACTIONS {
  SUB_PAYMENT_SUCCEEDED = "SUB_PAYMENT_SUCCEEDED",
  REFUND_SUB = "REFUND_SUB",
}

export type PAYMENT_TYPE_PREDICTION = {
  type: PAYMENT_TYPE.SUBSCRIPTION | PAYMENT_TYPE.ARTICLE | PAYMENT_TYPE.TICKET;
  paymentIntent: string;
};

export enum REFUND_TYPES {
  SUBSCRIPTION = "SubscriptionPayment",
  TICKET = "TicketPayment",
  ARTICLE = "ArticlePayment",
}
