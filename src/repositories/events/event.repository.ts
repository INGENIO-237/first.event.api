import { Service } from "typedi";
import { Image } from "../../utils/constants/common";
import { CreateEvent } from "../../schemas/events/event.schemas";
import Event from "../../models/events/event.model";

@Service()
export default class EventsRepo {
  async createEvent(event: CreateEvent["body"] & {image: Image}) {
    return await Event.create(event);
  }
}
