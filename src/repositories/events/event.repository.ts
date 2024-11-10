import { Service } from "typedi";
import {
  CreateEventPayload,
  GetEvents,
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
    const geo = location?.geo;
    const city = location?.city ?? ""; // cause casting to string will fail if undefined
    const country = location?.country ?? "";

    const lat = geo?.lat ?? 56.1304;
    const lng = geo?.lng ?? -106.3468;

    const query = search ?? "";
    const skipPage = page ?? 1;
    const offset = limit ?? 30;

    const events = query
      ? await Event.find({
          $or: [
            { title: { $regex: query, $options: "i" } },
            { description: { $regex: query, $options: "i" } },
            { "location.city": { $regex: query, $options: "i" } },
            { "location.country": { $regex: query, $options: "i" } },
            {
              "location.geo": {
                $geoWithin: {
                  $centerSphere: [
                    [lng, lat], // Center of the search area (longitude, latitude)
                    50 / 6378.1, // 50 km radius in radians
                  ],
                },
              },
            },
          ],
        })
      : await Event.aggregate([
          {
            $match: {
              $or: [
                {
                  $or: [
                    { "location.city": { $regex: city, $options: "i" } },
                    { "location.country": { $regex: country, $options: "i" } },
                  ],
                },

                { startDate: { $gte: startDate ?? new Date() } },
                { endDate: { $lte: endDate } },
                { organizer: new Types.ObjectId(organizer) },
                { eventType: type },
                { status },
                {
                  "location.geo": {
                    $geoWithin: {
                      $centerSphere: [[lng, lat], 50 / 6378.1], // 6378.1 being the approximate value of the radius of earth in km
                    },
                  },
                },
              ],
            },
          },
          { $skip: (skipPage - 1) * offset },
          { $limit: offset },
        ]);

    return events;
  }

  async createEvent(event: CreateEventPayload) {
    return await Event.create(event);
  }

  async getEvent(id: string) {
    return await Event.findById(id).populate("organizer");
  }
}
