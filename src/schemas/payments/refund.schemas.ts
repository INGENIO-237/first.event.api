export type CreateRefund = {
  amount: number;
  refundRef: string;
  paymentIntent: string;
  refundType: string;
  payment: string;
  acquirerReferenceNumber: string
};