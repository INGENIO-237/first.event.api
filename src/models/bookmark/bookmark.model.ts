import { Document, InferSchemaType, model, Schema, Types } from "mongoose";

const bookmarkSchema = new Schema(
  {
    user: {
      type: Types.ObjectId,
      ref: "User",
      required: true,
    },
  },
  { timestamps: true, discriminatorKey: "type" }
);

export interface IBookmark
  extends Document,
    InferSchemaType<typeof bookmarkSchema> {}

const Bookmark = model<IBookmark>("Bookmark", bookmarkSchema);

export default Bookmark;
