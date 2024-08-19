import { Service } from "typedi";
import { Request, Response } from "express";
import { CreatePlan } from "../../schemas/subs/plan.schema";
import HTTP from "../../utils/constants/http.responses";
import { PlanServices } from "../../services/subs";

@Service()
export default class PlanController {
  constructor(private service: PlanServices) {}

  async createPlan(req: Request<{}, {}, CreatePlan["body"]>, res: Response) {
    const plan = await this.service.createPlan(req.body);

    return res.status(HTTP.CREATED).json(plan);
  }

  async getPlans(req: Request, res: Response) {
    const plans = await this.service.getPlans();

    return res.status(HTTP.OK).json(plans);
  }
}
