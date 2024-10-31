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

export enum ORDER_TYPE {
  TICKET = "TicketOrder",
  PRODUCT = "ProductOrder",
}

export enum ORDER_PAYMENT_TYPE {
  TICKET = "TicketPayment",
  PRODUCT = "ProductPayment",
}

export type ComputeTotalTicketData = {
  tickets: { quantity: number; price: number }[];
  coupons?: string[];
};

export type DiscountedCoupon = {
  code: string;
  discount: number;
  share: number | undefined | null;
  rate: number;
};

export type CartItem = {
  product: string;
  quantity: number;
};
