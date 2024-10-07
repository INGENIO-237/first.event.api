import { Service } from "typedi";
import EventsRepo from "../../repositories/events/event.repository";
import {
  CreateEvent,
  CreateEventPayload,
} from "../../schemas/events/event.schemas";
import { Image } from "../../utils/constants/common";
import CloudinaryServices from "../utils/cloudinary.services";
import OrganizerServices from "../professionals/organizer.services";
import ApiError from "../../utils/errors/errors.base";
import HTTP from "../../utils/constants/http.responses";
import { IOrganizer } from "../../models/professionals/organizer.model";
import SubscriptionServices from "../subs/subscription.services";
import { ISubscription } from "../../models/subs/subscription.model";
import { TICKETS_PER_EVENT } from "../../utils/constants/plans-and-subs";

@Service()
export default class EventServices {
  constructor(
    private readonly eventRepo: EventsRepo,
    private readonly cloudinary: CloudinaryServices,
    private readonly organizerService: OrganizerServices,
    private readonly subscriptionService: SubscriptionServices
  ) {}

  // TODO: A day after an event is done, automatically send the funds to the organizer

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
    }

    return await this.eventRepo.createEvent(event as CreateEventPayload);
  }

  async updateEvent() {
    // TODO: Only Admins and organizer can update a given event

    // Once published:
    // TODO: Can't change tickets anymore. Can add more tickets(if under the tickets limit), but can't update the previous ones
    // TODO: Can't switch status back to draft, if tickets already sold

    // TODO: If updated, delete the previous remote image
  }
}
