import { Service } from "typedi";
import EventServices from "../../services/events/event.services";
import { Request, Response } from "express";
import { CreateEvent, GetEvents, UpdateEvent } from "../../schemas/events/event.schemas";
import { Image } from "../../utils/constants/common";
import HTTP from "../../utils/constants/http.responses";

@Service()
export default class EventController {
  constructor(private readonly service: EventServices) {}

  async getEvents(req: Request<{}, {}, {}, GetEvents["query"]>, res: Response) {
    const events = await this.service.getEvents(req.query);

    return res.status(HTTP.OK).json(events);
  }

  async createEvent(req: Request<{}, {}, CreateEvent["body"]>, res: Response) {
    const { id } = (req as any).user;

    const event = await this.service.createEvent({
      ...req.body,
      user: id,
    } as CreateEvent["body"] & { image: Image; user: string });

    return res.status(HTTP.CREATED).json(event);
  }

  async updateEvent(req: Request<UpdateEvent["params"], {}, UpdateEvent["body"]>, res: Response) {
    const { id } = (req as any).user;

    const event = await this.service.createEvent({
      ...req.body,
      user: id,
    } as CreateEvent["body"] & { image: Image; user: string });

    return res.status(HTTP.CREATED).json(event);
  }
}
