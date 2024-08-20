import { Service } from "typedi";
import { CreatePlan } from "../../schemas/subs/plan.schemas";
import Plan from "../../models/subs/plan.model";

@Service()
export default class PlanRepo {
  async createPlan(payload: CreatePlan["body"]) {
    return await Plan.create(payload);
  }

  async getPlans() {
    return await Plan.find().select("-__v");
  }

  async getPlan(planId: string) {
    return await Plan.findById(planId);
  }
}
