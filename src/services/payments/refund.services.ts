import { Service } from "typedi";
import RefundRepo from "../../repositories/payments/refund.repository";
import { CreateRefund } from "../../schemas/payments/refund.schemas";
import { ISubscriptionPayment } from "../../models/payments/subscription.payment.model";
import {
  BILLING_TYPE,
  PAYMENT_STATUS,
  PAYMENT_TYPE_PREDICTION,
  REFUND_TYPES,
} from "../../utils/constants/plans-and-subs";
import moment from "moment";
import PaymentsServices from "./payments.services";
import { PAYMENT_TYPE } from "../../utils/constants/common";
import ApiError from "../../utils/errors/errors.base";
import HTTP from "../../utils/constants/http.responses";

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
      let refundId;
      let acquirerReferenceNumber;
      let refundType;

      const { rfId, acquirer } = await this.paymentService.refundPayment({
        paymentId,
        amount,
        paymentType,
      });
      refundId = rfId as string;
      acquirerReferenceNumber = acquirer as string;

      // Subscription refund
      // TODO: Convert to a switch statement
      if (paymentType === PAYMENT_TYPE.SUBSCRIPTION) {
        refundType = REFUND_TYPES.SUBSCRIPTION;
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
  // TODO: Update refund
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
