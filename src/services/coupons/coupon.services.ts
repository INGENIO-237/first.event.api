import { Service } from "typedi";
import ProductCouponServices from "./product.coupon.services";
import TicketCouponServices from "./ticket.coupon.services";
import ApiError from "../../utils/errors/errors.base";
import HTTP from "../../utils/constants/http.responses";

@Service()
export default class CouponServices {
  constructor(
    private readonly product: ProductCouponServices,
    private readonly ticket: TicketCouponServices
  ) {}

  async applyCoupons({
    coupons,
    amount,
  }: {
    coupons: string[];
    amount: number;
  }) {
    let total = amount;
    let discount = 0;

    coupons.forEach(async (coupon) => {
      const cpn =
        (await this.product.getCoupon({ code: coupon })) ??
        (await this.ticket.getCoupon({ code: coupon }));

      if (!cpn || cpn.status === "inactive") {
        throw new ApiError(HTTP.NOT_FOUND, "Un ou plusieurs coupons invalides");
      }

      discount += cpn.discount;

      //   TODO: Remove
      console.log({ coupon, discount });

      //   TODO: Compute gains if coupon is for influencer
    });

    total -= (total * discount) / 100;

    return total;
  }
}
