import "reflect-metadata";

import { Router } from "express";
import { isAdmin } from "../../middlewares/auth";
import validate from "../../middlewares/validate.request";
import { createPlanSchema } from "../../schemas/subs/plan.schema";
import Container from "typedi";
import { PlanController } from "../../controllers/subs";

const PlanRouter = Router();
const controller = Container.get(PlanController);

// TODO: Uncomment
// PlanRouter.use(isAdmin)

PlanRouter.post(
  "",
  validate(createPlanSchema),
  controller.createPlan.bind(controller)
);

PlanRouter.get("");

export default PlanRouter;
