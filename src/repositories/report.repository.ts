import { Types } from "mongoose";
import { Service } from "typedi";
import Report from "../models/report.model";
import {
  CreateReportPayload,
  GetReports,
  UpdateReport,
} from "../schemas/report.schemas";

@Service()
export default class ReportRepo {
  async create(payload: CreateReportPayload) {
    return await Report.create(payload);
  }

  async findAll(query: GetReports["query"]) {
    const { status, from, to, limit, page } = query;

    return await Report.find({
      ...(status && { status }),
      ...(from &&
        to && {
          createdAt: {
            $gte: from,
            $lte: to,
          },
        }),
    })
      .skip((Number(page) - 1) * Number(limit))
      .limit(Number(limit))
      .populate({
        path: "user",
        select: "firstname lastname email professional",
      })
      .populate("product")
      .populate({
        path: "target",
        select: "firstname lastname email professional",
      })
      .populate("event")
      .sort({ createdAt: -1 });
  }

  async findOne(reportId: string) {
    return await Report.findById(reportId);
  }

  async update(id: string, payload: UpdateReport["body"]) {
    return await Report.findByIdAndUpdate(id, payload, { new: true });
  }
}
