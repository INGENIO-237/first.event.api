import { Service } from "typedi";
import ReportRepo from "../repositories/report.repository";
import {
  CreateReportPayload,
  GetReports,
  UpdateReport,
} from "../schemas/report.schemas";
import HTTP from "../utils/constants/http.responses";
import ApiError from "../utils/errors/errors.base";
import EventServices from "./events/event.services";
import ProductServices from "./products/product.services";
import UserServices from "./user.services";

@Service()
export default class ReportServices {
  constructor(
    private readonly repository: ReportRepo,
    private readonly userService: UserServices,
    private readonly eventService: EventServices,
    private readonly productService: ProductServices
  ) {}

  async create(payload: CreateReportPayload) {
    const { event, target, product, user } = payload;

    if (event) await this.eventService.getEvent({ eventId: event });
    if (target) await this.userService.getUser({ userId: target });
    if (product) await this.productService.getProduct({ productId: product });

    if (user == target) {
      throw new ApiError(
        HTTP.BAD_REQUEST,
        "Vous ne pouvez pas vous signaler vous-même"
      );
    }

    return await this.repository.create(payload);
  }

  async findAll(query: GetReports["query"]) {
    return await this.repository.findAll(query);
  }

  async findOne(id: string, raiseException = true) {
    const report = await this.repository.findOne(id);

    if (!report && raiseException) {
      throw new ApiError(HTTP.NOT_FOUND, "Signalement non trouvé");
    }

    return report;
  }

  async update(id: string, payload: UpdateReport["body"]) {
    await this.findOne(id);

    return await this.repository.update(id, payload);
  }
}
