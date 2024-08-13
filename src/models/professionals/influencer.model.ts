import { InferSchemaType, Schema } from "mongoose";
import Profile, { IProfile } from "../profile.model";

const influencerSchema = new Schema({
  experience: {
    type: String,
    required: true,
  },
  pastEvents: {
    type: String,
    required: true,
  },
  approximatePeople: {
    type: String,
    required: true,
  },
  channels: {
    type: [
      {
        name: {
          type: String,
          required: true,
        },
        followers: {
          type: Number,
          required: true,
        },
        link: {
          type: String,
          required: true,
        },
      },
    ],
    required: false,
  },
});

export interface IInfluencer
  extends IProfile,
    InferSchemaType<typeof influencerSchema> {}

const Influencer = Profile.discriminator<IInfluencer>(
  "Influencer",
  influencerSchema
);

export default Influencer;
