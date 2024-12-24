import { Types } from "mongoose";
import { Service } from "typedi";
import EventBookmark from "../../models/bookmark/event.bookmark.model";
import { CreateEventBookmarkPayload } from "../../schemas/bookmarks/event.bookmar.schemas";

@Service()
export default class EventBookmarkRepo {
  async create(payload: CreateEventBookmarkPayload) {
    return await EventBookmark.create(payload);
  }

  async findAll(user: string) {
    return await EventBookmark.find({ user: new Types.ObjectId(user) })
      .populate("event")
      .select("-user");
  }

  async delete(id: string) {
    return await EventBookmark.findByIdAndDelete(id);
  }
}
