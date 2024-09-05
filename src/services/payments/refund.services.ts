import { Service } from "typedi";
import RefundRepo from "../../repositories/payments/refund.repository";
import { CreateRefund } from "../../schemas/payments/refund.schemas";

@Service()
export default class RefundServices {
  constructor(private repository: RefundRepo) {}

  async createRefund(payload: CreateRefund) {
    return await this.repository.createRefund({ fees: 0, ...payload });
  }

  // TODO: Get list of refunds
  // TODO: Update refund
}
