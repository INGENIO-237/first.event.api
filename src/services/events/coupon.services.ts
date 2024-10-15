import { Service } from "typedi";
import CouponRepo from "../../repositories/events/coupon.repository";
import InfluencerCouponRepo from "../../repositories/events/influencer.coupon.repository";
import EventsServices from "./event.services";
import ApiError from "../../utils/errors/errors.base";
import HTTP from "../../utils/constants/http.responses";
import { RegisterCoupon } from "../../schemas/events/coupon.schemas";
import OrganizerServices from "../professionals/organizer.services";
import { Types } from "mongoose";
import crypto from "node:crypto";
import { alphabet } from "../../utils/constants/common";

@Service()
export default class CouponServices {
  constructor(
    private readonly couponRepo: CouponRepo,
    private readonly influencerCouponRepo: InfluencerCouponRepo,
    private readonly eventService: EventsServices,
    private readonly organizerService: OrganizerServices
  ) {}

  async registerCoupon({
    user,
    couponPaylaod,
  }: {
    user: string;
    couponPaylaod: RegisterCoupon["body"];
  }) {
    const { event: eventId } = couponPaylaod;

    const organizer = await this.organizerService.getOrganizer(user);
    const event = await this.eventService.getEvent({ eventId });

    // If the user is not the organizer of the event, then it can't be added a coupon
    if (
      event!.organizer.toString() !==
      (organizer!._id as Types.ObjectId).toString()
    ) {
      throw new ApiError(
        HTTP.UNAUTHORIZED,
        "Vous n'êtes pas autorisé à modifier cet événement"
      );
    }

    if (!event!.checkValidity()) {
      throw new ApiError(HTTP.BAD_REQUEST, "L'événement n'est pas/plus actif.");
    }

    const { influencer, share } = couponPaylaod;

    let coupon;

    const code = this.generateCouponCode();

    if (influencer && share) {
      coupon = await this.influencerCouponRepo.registerCoupon({
        ...couponPaylaod,
        code,
      });
    } else {
      coupon = await this.couponRepo.registerCoupon({ ...couponPaylaod, code });
    }

    return coupon;
  }

  private generateCouponCode(options?: {
    length?: number;
    type?: "ticket" | "article";
  }) {
    const length = options ? options.length || 5 : 5;
    const type = options ? options.type || "ticket" : "ticket";

    const prefix = type === "ticket" ? "TC-" : "AC-";
    const bytes = crypto.randomBytes(length);
    let code = "";
    for (let i = 0; i < length; i++) {
      code += alphabet[bytes[i] % alphabet.length];
    }

    return prefix + code;
  }
}
