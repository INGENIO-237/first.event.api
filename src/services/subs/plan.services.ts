import { Service } from "typedi";
import { CreatePlan } from "../../schemas/subs/plan.schemas";
import { PlanRepo } from "../../repositories/subs";
import ApiError from "../../utils/errors/errors.base";
import HTTP from "../../utils/constants/http.responses";

@Service()
export default class PlanServices {
  constructor(private repository: PlanRepo) {}

  async createPlan(payload: CreatePlan["body"]) {
    return this.repository.createPlan(payload);
  }

  async getPlans() {
    return await this.repository.getPlans();
  }

  async getPlan(planId: string, raiseException = false) {
    const plan = await this.repository.getPlan(planId);

    if (!plan && raiseException) {
      throw new ApiError(HTTP.NOT_FOUND, "Ce plan de facturation n'existe pas");
    }

    return plan;
  }
}
