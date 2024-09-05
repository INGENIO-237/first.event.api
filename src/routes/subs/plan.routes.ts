import "reflect-metadata";

import { Router } from "express";
import { isAdmin } from "../../middlewares/auth";
import validate from "../../middlewares/validate.request";
import { createPlanSchema } from "../../schemas/subs/plan.schemas";
import Container from "typedi";
import { tryCatch } from "../../utils/errors/errors.utlis";
import PlanController from "../../controllers/subs/plan.controller";

const PlanRouter = Router();
const controller = Container.get(PlanController);

// TODO: Uncomment
// PlanRouter.use(isAdmin)

PlanRouter.post(
  "",
  validate(createPlanSchema),
  tryCatch(controller.createPlan.bind(controller))
);

PlanRouter.get("", tryCatch(controller.getPlans.bind(controller)));

// TODO: Routes for getting a single plan and updating and deleting plans (Admins)

export default PlanRouter;
