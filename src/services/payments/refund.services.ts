import moment from "moment";
import { Service } from "typedi";
import { ISubscriptionPayment } from "../../models/payments/subscription.payment.model";
import RefundRepo from "../../repositories/payments/refund.repository";
import { CreateRefund } from "../../schemas/payments/refund.schemas";
import { PAYMENT_TYPE } from "../../utils/constants/common";
import HTTP from "../../utils/constants/http.responses";
import {
  BILLING_TYPE,
  PAYMENT_STATUS,
  PAYMENT_TYPE_PREDICTION,
  REFUND_TYPES,
} from "../../utils/constants/payments-and-subs";
import ApiError from "../../utils/errors/errors.base";
import PaymentsServices from "./payments.services";

@Service()
export default class RefundServices {
  constructor(
    private repository: RefundRepo,
    private paymentService: PaymentsServices
  ) {}

  async createRefund(payload: CreateRefund) {
    return await this.repository.createRefund({ fees: 0, ...payload });
  }

  async getRefund({
    refundId,
    paymentIntent,
    raiseException = false,
  }: {
    refundId?: string;
    paymentIntent?: string;
    raiseException?: boolean;
  }) {
    const refund = await this.repository.getRefund({ refundId, paymentIntent });

    if (!refund && raiseException) {
      throw new ApiError(HTTP.NOT_FOUND, "Remboursement non trouvé");
    }

    return refund;
  }

  async processSubRefundRequest({
    endsOn,
    freemiumEndsOn,
    payment,
  }: {
    endsOn: Date;
    freemiumEndsOn: Date;
    payment: any;
  }) {
    const {
      billed,
      amount,
      unitPrice,
      _id: paymentId,
    } = payment as ISubscriptionPayment;

    let amountToRefund = amount;

    const present = new Date();
    const presentTime = present.getTime();
    const freePeriod = freemiumEndsOn.getTime();

    if (freePeriod < presentTime) {
      if (billed === BILLING_TYPE.MONTHLY) {
        const remainingDays = moment(present).diff(endsOn, "days");
        amountToRefund = (unitPrice as number) * remainingDays;
      } else {
        const remainingMonths = moment(present).diff(endsOn, "months");
        amountToRefund = (unitPrice as number) * remainingMonths;
      }
    }

    // Initiate refunding
    await this.initiateRefund({
      paymentId: paymentId as string,
      amount: amountToRefund,
    });
  }

  async processTicketRefundRequest({
    amount,
    payment,
  }: {
    amount: number;
    payment: string;
  }) {
    await this.initiateRefund({
      paymentId: payment,
      amount,
    });
  }

  async processProductRefundRequest({
    amount,
    payment,
  }: {
    amount: number;
    payment: string;
  }) {
    await this.initiateRefund({
      paymentId: payment,
      amount,
    });
  }

  async initiateRefund({
    paymentId,
    amount,
  }: {
    paymentId: string;
    amount: number;
  }) {
    //  Predict payment type to be refunded
    const { type: paymentType, paymentIntent } =
      (await this.paymentService.predictPaymentType({
        paymentId,
      })) as PAYMENT_TYPE_PREDICTION;

    if (paymentType) {
      let refundType;

      const { rfId, acquirer } = await this.paymentService.refundPayment({
        paymentId,
        amount,
        paymentType,
      });
      const refundId = rfId as string;
      const acquirerReferenceNumber = acquirer as string;

      // Set refund type
      switch (paymentType) {
        case PAYMENT_TYPE.TICKET:
          refundType = REFUND_TYPES.TICKET;
          break;
        case PAYMENT_TYPE.PRODUCT:
          refundType = REFUND_TYPES.PRODUCT;
          break;
        default:
          refundType = REFUND_TYPES.SUBSCRIPTION;
          break;
      }

      // Persist refund
      if (refundId) {
        return await this.createRefund({
          amount,
          paymentIntent,
          refundRef: refundId,
          payment: paymentId,
          refundType: refundType as string,
          acquirerReferenceNumber: acquirerReferenceNumber as string,
        });
      }
    }
  }

  // TODO: Get list of refunds

  async updateRefund({
    refundId,
    paymentIntent,
    status,
    failMessage,
  }: {
    refundId?: string;
    paymentIntent?: string;
    status: PAYMENT_STATUS;
    failMessage?: string;
  }) {
    await this.repository.updateRefund({
      refundId,
      paymentIntent,
      status,
      failMessage,
    });
  }
}
