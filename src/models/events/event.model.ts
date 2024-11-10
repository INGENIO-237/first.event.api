import "reflect-metadata";

import { InferSchemaType, Model, Schema, Types } from "mongoose";
import {
  EVENT_STATUS,
  EVENT_TYPE,
  TAX_POLICY,
} from "../../utils/constants/events";
import { Document } from "mongoose";
import { model } from "mongoose";
import Container from "typedi";
import OrganizerServices from "../../services/professionals/organizer.services";
import EventServices from "../../services/events/event.services";
import ApiError from "../../utils/errors/errors.base";
import HTTP from "../../utils/constants/http.responses";
import { getSlug } from "../../utils/utilities";
import { IOrganizer } from "../professionals/organizer.model";

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
            type: String,
            enum: ["Point"],
            required: true,
            default: "Point",
          },
          coordinates: {
            type: [Number],
            required: true,
          },
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
      default: TAX_POLICY.ABSORB,
    },
    tickets: [
      {
        cat: { type: String, required: true },
        price: { type: Number, required: true },
        quantity: { type: Number, required: true },
      },
    ],
    remainingTickets: {
      type: Number,
      default: 100,
    },
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

eventSchema.virtual("slug").get(function () {
  return getSlug(this.title);
});

eventSchema.statics.checkValidity = async function (event: string) {
  const eventService = Container.get(EventServices);

  const matchingEvent = await eventService.getEvent({ eventId: event });

  const now = new Date();
  const startDate = new Date(matchingEvent!.startDate);
  const endDate = matchingEvent!.endDate
    ? new Date(matchingEvent!.endDate)
    : null;

  const dateIsValid =
    startDate >= now && (!endDate || new Date(endDate) >= now);

  if (matchingEvent!.status !== EVENT_STATUS.PUBLISHED) {
    throw new ApiError(HTTP.BAD_REQUEST, "L'événement n'est pas actif.");
  }

  if (!dateIsValid) {
    throw new ApiError(HTTP.BAD_REQUEST, "L'événement est déjà passé.");
  }

  return matchingEvent!;
};

eventSchema.statics.checkOwnership = async function ({
  user,
  event,
}: {
  user: string;
  event: string;
}) {
  const organizerService = Container.get(OrganizerServices);
  const eventService = Container.get(EventServices);

  const organizer = await organizerService.getOrganizer(user);
  const matchingEvent = await eventService.getEvent({ eventId: event });

  if (
    matchingEvent!.organizer.toString() !==
    (organizer!._id as Types.ObjectId).toString()
  ) {
    throw new ApiError(
      HTTP.UNAUTHORIZED,
      "Vous n'êtes pas autorisé à modifier cet événement"
    );
  }
};

export interface IEvent extends InferSchemaType<typeof eventSchema>, Document {}

interface EventModel extends Model<IEvent> {
  checkValidity(event: string): Promise<IEvent>;
  checkOwnership(args: { user: string; event: string }): Promise<void>;
}

const Event = model<IEvent, EventModel>("Event", eventSchema);

export default Event;
