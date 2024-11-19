import { Document, InferSchemaType, model, Schema, Types } from "mongoose";

const profileSchema = new Schema(
  {
    user: {
      type: Types.ObjectId,
      ref: "User",
      required: true,
    },
    rating: {
      type: Number,
      default: 0,
    },
    connectedAccount: String,
    connectedAccountCompleted: {
      type: Boolean,
      default: false,
    },
    accountCompletionLink: String,
    accountLinkExpiresAt: Date
  },
  {
    timestamps: true,
    discriminatorKey: "type",
    toJSON: { virtuals: true },
    toObject: { virtuals: true },
  }
);

export interface IProfile
  extends Document,
    InferSchemaType<typeof profileSchema> {}

const Profile = model<IProfile>("Profile", profileSchema);

export default Profile;
