import { Service } from "typedi";
import ProductCouponServices from "./product.coupon.services";
import TicketCouponServices from "./ticket.coupon.services";
import ApiError from "../../utils/errors/errors.base";
import HTTP from "../../utils/constants/http.responses";
import { COUPON_STATUS, DiscountedCoupon } from "../../utils/constants/common";

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
    const cpns: DiscountedCoupon[] = [];
    let total = amount;
    let discount = 0;

    await Promise.all(
      coupons.map(async (coupon) => {
        const cpn =
          (await this.product.getCoupon({
            code: coupon,
            raiseException: false,
          })) ??
          (await this.ticket.getCoupon({
            code: coupon,
            raiseException: false,
          }));

        if (!cpn || cpn.status === COUPON_STATUS.INACTIVE) {
          throw new ApiError(
            HTTP.NOT_FOUND,
            "Un ou plusieurs coupons invalides"
          );
        }

        discount += cpn.discount;

        cpns.push({
          code: cpn.code,
          discount: (total * cpn.discount) / 100,
          share: cpn.share,
          rate: cpn.discount,
        });

        //   TODO: Compute gains if coupon is for influencer
      })
    );

    const totalDiscount = (total * discount) / 100;

    total = total - totalDiscount;

    return { total, coupons: cpns };
  }
}
