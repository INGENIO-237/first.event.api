import { Service } from "typedi";
import config from "../../../config";
import { IProductPayment } from "../../../models/payments/product.payment.model";
import { IUser } from "../../../models/user.model";
import ProductPaymentRepo from "../../../repositories/payments/product.payments.repository";
import { CreateProductPaymentPayload } from "../../../schemas/payments/product.payment.schemas";
import {
  ComputeTotalProductData,
  DiscountedCoupon,
  ENV,
} from "../../../utils/constants/common";
import HTTP from "../../../utils/constants/http.responses";
import {
  PAYMENT_ACTIONS,
  PAYMENT_STATUS,
} from "../../../utils/constants/payments-and-subs";
import ApiError from "../../../utils/errors/errors.base";
import CartServices from "../../cart.services";
import CouponServices from "../../coupons/coupon.services";
import UserServices from "../../user.services";
import StripeServices from "../stripe.services";
import EventEmitter from "node:events";
import EventBus from "../../../hooks/event-bus";
import moment from "moment";
import { ObjectId } from "mongoose";

@Service()
export default class ProductPaymentServices {
  private emitter: EventEmitter;

  constructor(
    private readonly repository: ProductPaymentRepo,
    private readonly userService: UserServices,
    private readonly stripe: StripeServices,
    private readonly couponService: CouponServices,
    private readonly cartService: CartServices
  ) {
    this.emitter = EventBus.getEmitter();
  }

  async createProductPayment(payload: CreateProductPaymentPayload) {
    const { coupons, paymentMethodId, user, billing, shipping } = payload;

    if (billing.sameAsProfile || shipping.sameAsProfile) {
      const { addresses } = (await this.userService.getUser({
        userId: user,
        raiseException: true,
      })) as IUser;

      if (!addresses) {
        throw new ApiError(
          HTTP.BAD_REQUEST,
          "Veuillez compléter votre profil et rajouter les adresses de facturation et de livraison"
        );
      } else {
        const { billing: userBillingAddr, shipping: userShippingAddr } =
          addresses;

        if (!userBillingAddr) {
          throw new ApiError(
            HTTP.BAD_REQUEST,
            "Veuillez compléter votre profil et rajouter l'adresse de facturation"
          );
        }

        if (!userShippingAddr) {
          throw new ApiError(
            HTTP.BAD_REQUEST,
            "Veuillez compléter votre profil et rajouter l'adresse de livraison"
          );
        }
      }
    }

    const { items } = (await this.cartService.getCart(user)) as any;

    if (items.length < 1) {
      throw new ApiError(HTTP.BAD_REQUEST, "Votre panier est vide");
    }

    const { stripeCustomer } = (await this.userService.getUser({
      userId: user,
      raiseException: false,
    })) as IUser;

    const { total, cpns } = await this.computeTotal({
      items,
      coupons: coupons as string[],
    });

    const { paymentIntent, clientSecret, ephemeralKey, fees } =
      await this.stripe.initiatePayment({
        amount: total,
        customerId: stripeCustomer as string,
        paymentMethodId,
      });

    const { _id: paymentId } = await this.repository.createProductPayment({
      ...payload,
      paymentIntent,
      amount: total,
      fees,
      coupons: cpns,
      items: items.map((item: { quantity: number; product: any }) => ({
        // product being any is intentional. Just leave it as it is
        product: item.product._id as string,
        quantity: item.quantity,
      })),
    });

    if (process.env.NODE_ENV !== ENV.PROD || paymentMethodId) {
      setTimeout(() => {
        this.stripe.confirmPaymentIntent(paymentIntent);
      }, config.PAYMENT_CONFIRMATION_TIMEOUT);
    }

    return {
      paymentIntent,
      clientSecret,
      ephemeralKey,
      paymentId,
    };
  }

  async requestProductPaymentRefund({
    payment,
    user,
  }: {
    payment: string;
    user: {
      id: string;
      isAdmin: boolean;
    };
  }) {
    const {
      user: payer,
      amount,
      paymentIntent,
      updatedAt,
      refund,
    } = (await this.getProductPayment({
      paymentId: payment,
      raiseException: true,
    })) as IProductPayment;

    if (refund) {
      throw new ApiError(
        HTTP.BAD_REQUEST,
        "Vous avez déjà demandé un remboursement pour ce paiement."
      );
    }

    if ((payer as ObjectId).toString() !== user.id && !user.isAdmin) {
      throw new ApiError(
        HTTP.FORBIDDEN,
        "Vous n'êtes pas autorisé à effectuer cette action"
      );
    }

    if (paymentIntent == "free" || amount == 0) {
      throw new ApiError(
        HTTP.BAD_REQUEST,
        "Vous ne pouvez pas demander un remboursement pour cet événement.Veuillez contacter l'administrateur pour plus d'informations."
      );
    }

    const REFUND_DEADLINE = config.PRODUCT_REFUND_DEADLINE; // Days
    const present = new Date();

    const dateDiff = moment(present).diff(moment(updatedAt), "days");

    if (dateDiff > REFUND_DEADLINE) {
      throw new ApiError(
        HTTP.BAD_REQUEST,
        "Vous ne pouvez plus demander un remboursement pour cet événement. Le délai est passé. Veuillez contacter l'organisateur pour plus d'informations."
      );
    }

    this.emitter.emit(PAYMENT_ACTIONS.REFUND_PRODUCT, { payment, amount });
  }

  async refundProductPayment({
    paymentId,
    amount,
  }: {
    paymentId: string;
    amount: number;
  }) {
    const { paymentIntent } = (await this.getProductPayment({
      paymentId,
    })) as IProductPayment;

    return await this.stripe.createRefund({ paymentIntent, amount });
  }

  private async computeTotal(data: ComputeTotalProductData) {
    let total = 0;

    const { items, coupons } = data;

    let cpns: DiscountedCoupon[] = [];

    items.forEach((item) => {
      const {
        quantity,
        product: { price },
      } = item;

      total += price * quantity;
    });

    if (coupons) {
      const { total: discountedTotal, coupons: discountedCoupons } =
        await this.couponService.applyCoupons({
          coupons,
          amount: total,
        });

      cpns = discountedCoupons;
      total = discountedTotal;
    }

    return { total, cpns };
  }

  async getProductPayment({
    paymentIntent,
    paymentId,
    raiseException = false,
  }: {
    paymentIntent?: string;
    paymentId?: string;
    raiseException?: boolean;
  }) {
    const payment = await this.repository.getProductPayment({
      paymentIntent,
      paymentId,
    });

    if (!payment && raiseException) {
      throw new ApiError(HTTP.NOT_FOUND, "Paiement introuvable");
    }

    return payment;
  }

  async updateProductPayment({
    paymentId,
    paymentIntent,
    status,
    receipt,
    failMessage,
  }: {
    paymentId?: string;
    paymentIntent?: string;
    status?: PAYMENT_STATUS;
    receipt?: string;
    failMessage?: string;
  }) {
    await this.repository.updateProductPayment({
      paymentId,
      paymentIntent,
      status,
      receipt,
      failMessage,
    });

    // Clear user's cart
    if (status) {
      const { user } = (await this.repository.getProductPayment({
        paymentId,
        paymentIntent,
      })) as IProductPayment;

      await this.cartService.clearCart(user as string);
    }
  }
}
