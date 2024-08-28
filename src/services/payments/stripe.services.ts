import { Service } from "typedi";
import { Stripe } from "stripe";
import config from "../../config";
import ApiError from "../../utils/errors/errors.base";
import HTTP from "../../utils/constants/http.responses";

@Service()
export default class StripeServices {
  private _secretKey: string = config.STRIPE_SECRET_KEY;
  private _webHookSecret: string = config.STRIPE_WEBHOOK_ENDPOINT_SECRET;
  private _stripe: Stripe;
  private _fees = 3.1;

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
    const stripeFeesMargin = Math.ceil((amount * this._fees) / 100);
    const amountToBePaid = Math.ceil(amount + stripeFeesMargin); // initial amount + stripe fees

    const { client_secret, paymentIntent, customer } =
      await this.createPaymentIntent({
        amount: amountToBePaid,
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
      fees: stripeFeesMargin,
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
        amount: amount * 100, // american and european currency format
        currency,
        customer: customerId ?? id,
      });

    return { client_secret, paymentIntent, customer: customerId ?? id };
  }

  // Dev purpose only
  async confirmPaymentIntent(paymentIntent: string) {
    console.log(`Capturing ${paymentIntent}`);

    await this._stripe.paymentIntents.confirm(paymentIntent, {
      return_url: "https://webhook.site/4334a4fc-fc3f-47ef-8686-49acd9a22cea",
      payment_method: "pm_card_visa",
    });

    console.log(`Captured ${paymentIntent}`);
  }

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
