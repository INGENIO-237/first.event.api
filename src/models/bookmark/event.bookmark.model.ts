import { InferSchemaType, model, Schema, Types } from "mongoose";
import Bookmark, { IBookmark } from "./bookmark.model";

const eventBookmarkSchema = new Schema({
  event: {
    type: Types.ObjectId,
    ref: "Event",
    required: true,
  },
});

export interface IEventBookmark
  extends IBookmark,
    InferSchemaType<typeof eventBookmarkSchema> {}

const EventBookmark = Bookmark.discriminator<IEventBookmark>(
  "EventBookmark",
  eventBookmarkSchema
);

export default EventBookmark;
