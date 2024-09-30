import { Service } from "typedi";
import EventServices from "../../services/events/event.services";
import { Request, Response } from "express";
import { CreateEvent } from "../../schemas/events/event.schemas";
import { Image } from "../../utils/constants/common";
import HTTP from "../../utils/constants/http.responses";

@Service()
export default class EventController {
  constructor(private readonly service: EventServices) {}

  async createEvent(req: Request<{}, {}, CreateEvent["body"]>, res: Response) {
    const { id } = (req as any).user;

    const event = await this.service.createEvent({
      ...req.body, user: id,
    } as CreateEvent["body"] & { image: Image, user: string });

    return res.status(HTTP.CREATED).json(event);
  }
}
