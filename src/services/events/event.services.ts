import { Service } from "typedi";
import Event from "../../models/events/event.model";
import { IOrganizer } from "../../models/professionals/organizer.model";
import { ISubscription } from "../../models/subs/subscription.model";
import EventsRepo from "../../repositories/events/event.repository";
import {
  CreateEvent,
  CreateEventPayload,
  GetEvents,
  UpdateEventPayload,
} from "../../schemas/events/event.schemas";
import { Image } from "../../utils/constants/common";
import { EVENT_STATUS } from "../../utils/constants/events";
import HTTP from "../../utils/constants/http.responses";
import { TICKETS_PER_EVENT } from "../../utils/constants/payments-and-subs";
import ApiError from "../../utils/errors/errors.base";
import OrganizerServices from "../professionals/organizer.services";
import SubscriptionServices from "../subs/subscription.services";
import CloudinaryServices from "../utils/cloudinary.services";

@Service()
export default class EventServices {
  constructor(
    private readonly eventRepo: EventsRepo,
    private readonly cloudinary: CloudinaryServices,
    private readonly organizerService: OrganizerServices,
    private readonly subscriptionService: SubscriptionServices
  ) {}

  async getEvents(filters: GetEvents["query"]) {
    return await this.eventRepo.getEvents(filters);
  }

  async createEvent(
    event: CreateEvent["body"] & { image: Image; user?: string } // user has to be optional in order to delete it from the properties list
  ) {
    const { _id, subscription } = (await this.organizerService.getOrganizer(
      event.user!
    )) as IOrganizer;

    (event as any).organizer = _id as string;
    delete event.user;

    const { ticketsPerEvent } = (await this.subscriptionService.getSubscription(
      {
        subscriptionId: subscription as string,
      }
    )) as ISubscription;

    if (ticketsPerEvent !== TICKETS_PER_EVENT.PREMIUM) {
      const ticketsCounter = event.tickets.reduce(
        (acc, ticket) => acc + ticket.quantity,
        0
      );

      if (ticketsCounter > Number(ticketsPerEvent)) {
        await this.cloudinary.deleteResource(event.image.publicId);
        throw new ApiError(
          HTTP.BAD_REQUEST,
          `Vous ne pouvez pas créer plus de ${ticketsPerEvent} billets`
        );
      }

      (event as CreateEventPayload).remainingTickets = 100 - ticketsCounter;
    }

    return await this.eventRepo.createEvent(event as CreateEventPayload);
  }

  async getEvent({
    eventId,
    raiseException = true,
  }: {
    eventId: string;
    raiseException?: boolean;
  }) {
    const event = await this.eventRepo.getEvent(eventId);

    if (
      (!event && raiseException) ||
      (event &&
        (event.status === EVENT_STATUS.BANNED ||
          event.status === EVENT_STATUS.DELETED))
    ) {
      throw new ApiError(HTTP.NOT_FOUND, "Evénement introuvable");
    }

    return event;
  }

  async updateEvent({
    eventId,
    user,
    update,
  }: {
    eventId: string;
    update: UpdateEventPayload;
    user: string;
  }) {
    await Event.checkOwnership({ user, event: eventId });

    const event = await this.getEvent({ eventId });

    if (event!.status === EVENT_STATUS.PUBLISHED) {
      // TODO: Can't change tickets anymore. Can add more tickets(if under the tickets limit), but can't update the previous ones
      // TODO: Can't switch status back to draft, if tickets already sold
    }

    // TODO: If updated, delete the previous remote image
  }
}
