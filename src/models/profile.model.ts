import { Document, InferSchemaType, model, Schema, Types } from "mongoose";

const profileSchema = new Schema(
  {
    user: {
      type: Types.ObjectId,
      ref: "User",
    },
  },
  { timestamps: true, discriminatorKey: "type" }
);

export interface IProfile
  extends Document,
    InferSchemaType<typeof profileSchema> {}

const Profile = model<IProfile>("Profile", profileSchema);

export default Profile;
