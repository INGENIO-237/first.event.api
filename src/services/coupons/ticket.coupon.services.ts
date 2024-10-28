import { Service } from "typedi";
import Event from "../../models/events/event.model";
import TicketCouponRepo from "../../repositories/coupons/ticket.coupon.repository";
import {
  GetTicketCoupons,
  RegisterTicketCoupon,
  UpdateTicketCoupon,
} from "../../schemas/coupons/ticket.coupon.schemas";
import ApiError from "../../utils/errors/errors.base";
import HTTP from "../../utils/constants/http.responses";
import { ITicketCoupon } from "../../models/coupons/ticket.coupon.model";

@Service()
export default class TicketCouponServices {
  constructor(private readonly repository: TicketCouponRepo) {}

  async getCoupons({
    query,
    user,
  }: {
    user: string;
    query: GetTicketCoupons["query"];
  }) {
    const { event } = query;

    await Event.checkOwnership({ user, event });

    const coupons = await this.repository.getCoupons(query);

    return coupons;
  }

  async registerCoupon({
    user,
    couponPayload,
  }: {
    user: string;
    couponPayload: RegisterTicketCoupon["body"];
  }) {
    const { event, code } = couponPayload;

    await Event.checkOwnership({ user, event });
    await Event.checkValidity(event);

    const matchingCoupon = await this.getCoupon({
      code,
      raiseException: false,
    });

    if (matchingCoupon)
      throw new ApiError(HTTP.BAD_REQUEST, "Ce coupon existe déjà");

    const { influencer, share } = couponPayload;

    const coupon = await this.repository.registerCoupon({
      ...couponPayload,
      code,
    });

    return coupon;
  }

  async getCoupon({
    raiseException = true,
    ...query
  }: {
    code?: string;
    id?: string;
    raiseException?: boolean;
  }) {
    if (!query.code && !query.id)
      throw new ApiError(
        HTTP.BAD_REQUEST,
        "Veuillez passer soit l'identifiant ou le code du coupon"
      );

    const coupon = await this.repository.getCoupon(query);

    if (!coupon && raiseException) {
      throw new ApiError(HTTP.NOT_FOUND, "Coupon non trouvé");
    }

    return coupon;
  }

  async updateCoupon({
    user,
    couponPayload,
    couponId,
  }: {
    user: string;
    couponPayload: UpdateTicketCoupon["body"];
    couponId: string;
  }) {
    const { event } = (await this.getCoupon({ id: couponId })) as ITicketCoupon;

    event && (await Event.checkOwnership({ user, event: event.toString() }));
    event && (await Event.checkValidity(event.toString()));

    await this.repository.updateCoupon({
      couponPayload,
      coupon: couponId,
    });
  }
}
