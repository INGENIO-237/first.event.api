import { Service } from "typedi";
import { CreateEventPayload } from "../../schemas/events/event.schemas";
import Event from "../../models/events/event.model";

@Service()
export default class EventsRepo {
  async createEvent(event: CreateEventPayload) {
    return await Event.create(event);
  }
}
