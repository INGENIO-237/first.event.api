import "reflect-metadata";

import { Router } from "express";
import Container from "typedi";
import PlanController from "../../controllers/subs/plan.controller";
import { isAdmin, isLoggedIn } from "../../middlewares/auth";
import validate from "../../middlewares/validate.request";
import {
  createPlanSchema,
  updatePlanSchema,
} from "../../schemas/subs/plan.schemas";
import { tryCatch } from "../../utils/errors/errors.utlis";

const PlanRouter = Router();
const controller = Container.get(PlanController);

PlanRouter.post(
  "",
  isLoggedIn,
  isAdmin,
  validate(createPlanSchema),
  tryCatch(controller.createPlan.bind(controller))
);

PlanRouter.get("", tryCatch(controller.getPlans.bind(controller)));

PlanRouter.get("/:name", tryCatch(controller.getPlanByName.bind(controller)));

PlanRouter.put(
  "/:plan",
  isLoggedIn,
  isAdmin,
  validate(updatePlanSchema),
  tryCatch(controller.updatePlan.bind(controller))
);

PlanRouter.delete(
  "/:plan",
  isLoggedIn,
  isAdmin,
  tryCatch(controller.deletePlan.bind(controller))
);

export default PlanRouter;
