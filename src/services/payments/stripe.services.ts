import { Service } from "typedi";
import { Stripe } from "stripe";
import config from "../../config";
import ApiError from "../../utils/errors/errors.base";
import HTTP from "../../utils/constants/http.responses";
import { PAYMENT_STATUS } from "../../utils/constants/plans-and-subs";

@Service()
export default class StripeServices {
  private _secretKey: string = config.STRIPE_SECRET_KEY;
  private _webHookSecret: string = config.STRIPE_WEBHOOK_ENDPOINT_SECRET;
  private _stripe: Stripe;

  constructor() {
    this._stripe = new Stripe(this._secretKey);
  }

  async initiatePayment({
    amount,
    currency = "CAD",
    customerId,
  }: {
    amount: number;
    currency?: string;
    customerId?: string;
  }) {
    const { client_secret, paymentIntent, customer } =
      await this.createPaymentIntent({
        amount,
        currency,
        customerId,
      });

    const ephemeralKey = await this._stripe.ephemeralKeys.create(
      {
        customer,
      },
      { apiVersion: config.STRIPE_API_VERSION }
    );

    /**
     * @return
     * client_side, ephemeralKey, paymentIntent: will be used on the client-side to confirm the payment
     * ref: will be used as the payment reference on the backend for traceability purpose
     */
    return {
      clientSecret: client_secret,
      ephemeralKey,
      paymentIntent,
    };
  }

  private async createPaymentIntent({
    amount,
    currency,
    customerId,
  }: {
    amount: number;
    currency: string;
    customerId?: string;
  }) {
    const { id } = await this._stripe.customers.create();
    const { client_secret, id: paymentIntent } =
      await this._stripe.paymentIntents.create({
        amount,
        currency,
        customer: customerId ?? id,
      });

    return { client_secret, paymentIntent, customer: customerId ?? id };
  }

  // TODO: Use this function once the user is created
  async createStripeCustomer({
    fullname,
    email,
  }: {
    fullname: string;
    email: string;
  }) {
    const { id } = await this._stripe.customers.create({
      name: fullname,
      email,
    });

    return id;
  }

  constructEvent({
    data,
    signature,
  }: {
    data: string | Buffer;
    signature: string | string[];
  }) {
    try {
      return this._stripe.webhooks.constructEvent(
        data,
        signature,
        this._webHookSecret
      );
    } catch (err: any) {
      throw new ApiError(HTTP.BAD_REQUEST, `Webhook Error: ${err.message}`);
    }
  }
}
