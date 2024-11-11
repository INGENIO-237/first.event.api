import { InferSchemaType, Schema, Types } from "mongoose";
import Profile, { IProfile } from "../profile.model";

const organizerSchema = new Schema({
  experience: {
    type: String,
    required: true,
  },
  pastTeam: {
    type: String,
    required: true,
  },
  targetYearlyEvents: {
    type: String,
    required: true,
  },
  participationEvaluation: {
    type: String,
    required: true,
  },
  goals: {
    type: [String],
    required: true,
  },
  subscription: {
    type: Types.ObjectId,
    ref: "Subscription",
  },
  website: String,
  socialMedia: {
    facebook: String,
    twitter: String,
    instagram: String,
    linkedin: String,
    youtube: String,
    tiktok: String,
    other: String,
  },
  description: String
});

organizerSchema.virtual("rating").get(function () {
  // TODO: Compute rating based on user's reviews

  return 5;
});

export interface IOrganizer
  extends IProfile,
    InferSchemaType<typeof organizerSchema> {}

const Organizer = Profile.discriminator<IOrganizer>(
  "Organizer",
  organizerSchema
);

export default Organizer;
