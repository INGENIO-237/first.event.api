import { Service } from "typedi";
import { CreateRefund } from "../../schemas/payments/refund.schemas";
import Refund from "../../models/payments/refund.model";

@Service()
export default class RefundRepo {
  async createRefund(payload: CreateRefund & { fees: number }) {
    return await Refund.create(payload);
  }

  // TODO: Get list of refunds
  // TODO: Update refund
}
