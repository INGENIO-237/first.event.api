import { InferSchemaType, Schema, Types } from "mongoose";
import {
  EVENT_STATUS,
  EVENT_TYPE,
  TAX_POLICY,
} from "../../utils/constants/events";
import { Document } from "mongoose";
import { model } from "mongoose";

const eventSchema = new Schema(
  {
    organizer: {
      type: Types.ObjectId,
      ref: "Organizer",
      required: true,
    },
    title: {
      type: String,
      required: true,
    },
    image: {
      type: {
        url: { type: String, required: true },
        publicId: String,
      },
    },
    video: String,
    description: {
      type: String,
      required: true,
    },
    startDate: {
      type: Date,
      required: true,
    },
    endDate: Date,
    eventType: {
      type: String,
      enum: [...Object.values(EVENT_TYPE)],
      required: true,
    },
    eventLink: String,
    location: {
      type: {
        geo: {
          type: {
            lat: { type: Number, required: true },
            lng: { type: Number, required: true },
          },
          required: true,
        },
        address: {
          type: String,
          required: true,
        },
        city: {
          type: String,
          required: true,
        },
        state: {
          type: String,
          required: true,
        },
        country: {
          type: String,
          required: true,
        },
      },
    },
    category: {
      type: String,
      required: true,
    },
    tags: [String],
    isFree: {
      type: Boolean,
      default: false,
    },
    taxPolicy: {
      type: String,
      enum: [...Object.values(TAX_POLICY)],
    },
    tickets: [
      {
        cat: { type: String, required: true },
        price: { type: Number, required: true },
        quantity: { type: Number, required: true },
      },
    ],
    status: {
      type: String,
      enum: [...Object.values(EVENT_STATUS)],
      default: EVENT_STATUS.DRAFT,
    },
    views: {
      type: Number,
      default: 0,
    },
    likes: {
      type: Number,
      default: 0,
    },
    shares: {
      type: Number,
      default: 0,
    },
    isDeleted: {
      type: Boolean,
      default: false,
    },
  },
  {
    toJSON: {
      virtuals: true,
    },
    toObject: {
      virtuals: true,
    },
    timestamps: true,
  }
);

export interface IEvent extends InferSchemaType<typeof eventSchema>, Document {}

const Event = model<IEvent>("Event", eventSchema);

export default Event