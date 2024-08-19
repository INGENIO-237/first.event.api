import { Service } from "typedi";
import { CreatePlan } from "../../schemas/subs/plan.schema";
import Plan from "../../models/subs/plan.model";

@Service()
export default class PlanRepo {
  async createPlan(payload: CreatePlan["body"]) {
    return await Plan.create(payload);
  }

  async getPlans() {
    return await Plan.find().select("-__v");
  }
}
