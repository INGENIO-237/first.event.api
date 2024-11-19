import { Service } from "typedi";
import { IPlan } from "../../models/subs/plan.model";
import PlanRepo from "../../repositories/subs/plan.repository";
import { CreatePlan, UpdatePlan } from "../../schemas/subs/plan.schemas";
import HTTP from "../../utils/constants/http.responses";
import ApiError from "../../utils/errors/errors.base";

@Service()
export default class PlanServices {
  constructor(private repository: PlanRepo) {}

  async createPlan(payload: CreatePlan["body"]) {
    const existingPlan = (await this.getPlanByName(
      payload.name,
      false
    )) as IPlan;

    if (
      existingPlan &&
      existingPlan.name.toLowerCase() == payload.name.toLowerCase()
    ) {
      throw new ApiError(
        HTTP.BAD_REQUEST,
        "Ce plan de facturation existe déjà"
      );
    }

    return await this.repository.createPlan(payload);
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

  async getPlanByName(planName: string, raiseException = true) {
    const plan = await this.repository.getPlanByName(planName);

    if (!plan && raiseException) {
      throw new ApiError(HTTP.NOT_FOUND, "Ce plan de facturation n'existe pas");
    }

    return plan;
  }

  async updatePlan(planId: string, payload: UpdatePlan["body"]) {
    await this.getPlan(planId, true);

    return await this.repository.updatePlan(planId, payload);
  }

  async deletePlan(planId: string) {
    await this.getPlan(planId, true);

    return await this.repository.deletePlan(planId);
  }
}
