import { Service } from "typedi";
import EventBookmarkRepo from "../../repositories/bookmarks/event.bookmark.repository";
import { CreateEventBookmarkPayload } from "../../schemas/bookmarks/event.bookmar.schemas";

@Service()
export default class EventBookmarkServices {
  constructor(private readonly eventBookmarkRepo: EventBookmarkRepo) {}

  async create(payload: CreateEventBookmarkPayload) {
    return await this.eventBookmarkRepo.create(payload);
  }

  async findAll(user: string) {
    return await this.eventBookmarkRepo.findAll(user);
  }

  async delete(id: string) {
    return await this.eventBookmarkRepo.delete(id);
  }
}
