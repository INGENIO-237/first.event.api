import { Request, Response } from "express";
import { Service } from "typedi";
import {
    CreateReport,
    GetReports,
    UpdateReport,
} from "../schemas/report.schemas";
import ReportServices from "../services/report.services";
import HTTP from "../utils/constants/http.responses";

@Service()
export default class ReportController {
  constructor(private readonly service: ReportServices) {}

  async create(req: Request<{}, {}, CreateReport["body"]>, res: Response) {
    const { id } = (req as any).user;

    const report = await this.service.create({
      ...req.body,
      user: id as string,
    });

    return res.status(HTTP.CREATED).json(report);
  }

  async findAll(req: Request<{}, {}, {}, GetReports["query"]>, res: Response) {
    const reports = await this.service.findAll(req.query);

    return res.status(HTTP.OK).json(reports);
  }

  async update(
    req: Request<UpdateReport["params"], {}, UpdateReport["body"]>,
    res: Response
  ) {
    const report = await this.service.update(req.params.report, req.body);

    return res.status(HTTP.OK).json(report);
  }
}
