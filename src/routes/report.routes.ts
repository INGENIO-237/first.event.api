import "reflect-metadata";

import { Router } from "express";
import Container from "typedi";
import ReportController from "../controllers/report.controller";
import { isLoggedIn } from "../middlewares/auth";
import validate from "../middlewares/validate.request";
import {
  createReportSchema,
  getReportsSchema,
  updateReportSchema,
} from "../schemas/report.schemas";
import { tryCatch } from "../utils/errors/errors.utlis";

const ReportsRouter = Router();

const controller = Container.get(ReportController);

ReportsRouter.post(
  "",
  isLoggedIn,
  validate(createReportSchema),
  tryCatch(controller.create.bind(controller))
);

ReportsRouter.get(
  "",
  isLoggedIn,
  validate(getReportsSchema),
  tryCatch(controller.findAll.bind(controller))
);

ReportsRouter.put(
  "/:report",
  isLoggedIn,
  validate(updateReportSchema),
  tryCatch(controller.update.bind(controller))
);

export default ReportsRouter;
