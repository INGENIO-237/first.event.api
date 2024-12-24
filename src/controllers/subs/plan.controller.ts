import { Service } from "typedi";
import { Request, Response } from "express";
import { CreatePlan, UpdatePlan } from "../../schemas/subs/plan.schemas";
import HTTP from "../../utils/constants/http.responses";
import PlanServices from "../../services/subs/plan.services";

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

  async getPlan(req: Request, res: Response) {
    const plan = await this.service.getPlan(req.params.id);

    return res.status(HTTP.OK).json(plan);
  }

  async getPlanByName(req: Request, res: Response) {
    const plan = await this.service.getPlanByName(req.params.name);

    return res.status(HTTP.OK).json(plan);
  }

  async updatePlan(
    req: Request<UpdatePlan["params"], {}, UpdatePlan["body"]>,
    res: Response
  ) {
    const plan = await this.service.updatePlan(req.params.plan, req.body);

    return res.status(HTTP.OK).json(plan);
  }

  async deletePlan(req: Request, res: Response) {
    await this.service.deletePlan(req.params.plan);

    return res.sendStatus(HTTP.OK);
  }
}
