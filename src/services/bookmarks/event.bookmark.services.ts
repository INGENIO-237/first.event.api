import { Service } from "typedi";
import EventBookmarkRepo from "../../repositories/bookmarks/event.bookmark.repository";
import { CreateEventBookmarkPayload } from "../../schemas/bookmarks/event.bookmar.schemas";
import EventServices from "../events/event.services";

@Service()
export default class EventBookmarkServices {
  constructor(
    private readonly eventBookmarkRepo: EventBookmarkRepo,
    private readonly eventService: EventServices
  ) {}

  async create(payload: CreateEventBookmarkPayload) {
    const { event } = payload;

    await this.eventService.getEvent({ eventId: event });

    return await this.eventBookmarkRepo.create(payload);
  }

  async findAll(user: string) {
    return await this.eventBookmarkRepo.findAll(user);
  }

  async delete(id: string) {
    return await this.eventBookmarkRepo.delete(id);
  }
}
