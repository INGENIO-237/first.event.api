import { Document, InferSchemaType, model, Schema } from "mongoose";

const followingSchema = new Schema(
  {
    user: {
      type: Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },
    organizer: {
      type: Schema.Types.ObjectId,
      ref: "Organizer",
      required: true,
    },
  },
  {
    timestamps: true,
    versionKey: false
  }
);


export interface IFollowing extends Document, InferSchemaType<typeof followingSchema>{}

const Following = model<IFollowing>("Following", followingSchema);

export default Following;
