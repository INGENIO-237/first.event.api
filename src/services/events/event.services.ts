import { Service } from "typedi";
import EventsRepo from "../../repositories/events/event.repository";
import { CreateEvent } from "../../schemas/events/event.schemas";
import { Image } from "../../utils/constants/common";
import CloudinaryServices from "../utils/cloudinary.services";
import OrganizerServices from "../professionals/organizer.services";
import ApiError from "../../utils/errors/errors.base";
import HTTP from "../../utils/constants/http.responses";

@Service()
export default class EventServices {
  constructor(
    private readonly eventRepo: EventsRepo,
    private readonly cloudinary: CloudinaryServices,
    private readonly organizerService: OrganizerServices
  ) {}

  async createEvent(
    event: CreateEvent["body"] & { image: Image; user: string }
  ) {
    
    // Ensure user's subs can create more events

    return await this.eventRepo.createEvent(event);
  }
}
