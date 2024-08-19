import { Service } from "typedi";
import { CreatePlan } from "../../schemas/subs/plan.schema";
import { PlanRepo } from "../../repositories/subs";

@Service()
export default class PlanServices {
  constructor(private repository: PlanRepo) {}

  async createPlan(payload: CreatePlan["body"]) {
    return this.repository.createPlan(payload);
  }

  async getPlans() {
    return await this.repository.getPlans();
  }
}
