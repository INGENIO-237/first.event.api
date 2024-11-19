import { Service } from "typedi";
import { CreatePlan, UpdatePlan } from "../../schemas/subs/plan.schemas";
import Plan from "../../models/subs/plan.model";
import { generateCouponCode } from "../../utils/utilities";

@Service()
export default class PlanRepo {
  async createPlan(payload: CreatePlan["body"]) {
    return await Plan.create(payload);
  }

  async getPlans() {
    return await Plan.find({ hasBeenDeleted: false }).select("-__v");
  }

  async getPlan(planId: string) {
    return await Plan.findById(planId);
  }

  async getPlanByName(planName: string) {
    return await Plan.findOne({ name: { $regex: planName, $options: "i" } });
  }

  async updatePlan(planId: string, payload: UpdatePlan["body"]) {
    return await Plan.findByIdAndUpdate(planId, payload, { new: true });
  }

  async deletePlan(planId: string) {
    return await Plan.findByIdAndUpdate(planId, {
      hasBeenDeleted: true,
      name: generateCouponCode().toLowerCase(),
    });
  }
}
