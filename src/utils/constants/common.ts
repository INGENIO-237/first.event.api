export enum ENV {
  PROD = "production",
  DEV = "development",
}

export enum PAYMENT_TYPE {
  SUBSCRIPTION = "SUBSCRIPTION",
  TICKET = "TICKET",
  ARTICLE = "ARTICLE",
  REFUND = "REFUND",
}

export type Image = {
  url: string;
  publicId: string;
};

export const alphabet = "ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz";
