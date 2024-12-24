import { Document, InferSchemaType, model, Schema, Types } from "mongoose";

// TODO: Update influencer's social media

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
    accountLinkExpiresAt: Date,
    location: {
      type: {
        country: { type: String, required: true },
        state: { type: String, required: true },
        city: { type: String, required: true },
      },
      required: true,
    },
    socialMedia: {
      facebook: String,
      twitter: String,
      instagram: String,
      linkedin: String,
      youtube: String,
      tiktok: String,
      other: String,
    },
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
