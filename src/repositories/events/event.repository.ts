import { Service } from "typedi";
import {
  CreateEventPayload,
  GetEvents,
  Location,
} from "../../schemas/events/event.schemas";
import Event from "../../models/events/event.model";
import { Types } from "mongoose";

@Service()
export default class EventsRepo {
  async getEvents(filters: GetEvents["query"]) {
    const {
      organizer,
      search,
      page,
      limit,
      startDate,
      endDate,
      type,
      location,
      status,
    } = filters;
    const { geo, city, country } = location as Location;

    const { lat, lng } = geo as { lat: number; lng: number };

    return await Event.find({
      $or: [
        { title: { $regex: search, $options: "i" } },
        { description: { $regex: search, $options: "i" } },
        { "location.city": { $regex: search, $options: "i" } },
        { "location.country": { $regex: search, $options: "i" } },
      ],
      startDate: { $gte: startDate },
      endDate: { $lte: endDate },
      organizer: new Types.ObjectId(organizer),
      eventType: type,
      status,
      location: {
        geo: {
          $near: {
            $geometry: {
              type: "Point",
              coordinates: [lng, lat],
            },
            $maxDistance: 1000,
          },
        },
        city: { $regex: city, $options: "i" },
        country: { $regex: country, $options: "i" },
      },
    })
      .skip(((page as number) - 1) * (limit as number))
      .limit(limit as number);
  }

  async createEvent(event: CreateEventPayload) {
    return await Event.create(event);
  }

  async getEvent(id: string) {
    return await Event.findById(id);
  }
}
