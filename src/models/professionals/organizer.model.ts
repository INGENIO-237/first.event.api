import { Document, InferSchemaType, Schema, Types } from "mongoose";
import Profile from "../profile.model";

const organizerSchema = new Schema({
  user: {
    type: Types.ObjectId,
    ref: "User",
  },
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
});

export interface IOrganizer
  extends Document,
    InferSchemaType<typeof organizerSchema> {}

const Organizer = Profile.discriminator<IOrganizer>(
  "Organizer",
  organizerSchema
);

export default Organizer;
