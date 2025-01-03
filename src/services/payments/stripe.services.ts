import { Stripe } from "stripe";
import { Service } from "typedi";
import config from "../../config";
import HTTP from "../../utils/constants/http.responses";
import ApiError from "../../utils/errors/errors.base";
import logger from "../../utils/logger";

@Service()
export default class StripeServices {
  private _secretKey: string = config.STRIPE_SECRET_KEY;
  private _webHookSecret: string = config.STRIPE_WEBHOOK_ENDPOINT_SECRET;
  private _stripe: Stripe;
  private _fees = 4;

  constructor() {
    this._stripe = new Stripe(this._secretKey);
  }

  async initiatePayment({
    amount,
    currency = "CAD",
    customerId,
    paymentMethodId,
  }: {
    amount: number;
    currency?: string;
    customerId?: string;
    paymentMethodId?: string;
  }) {
    const stripeFeesMargin = Math.ceil((amount * this._fees) / 100);
    const amountToBePaid = Math.ceil(amount + stripeFeesMargin); // initial amount + stripe fees

    const { client_secret, paymentIntent, customer } =
      await this.createPaymentIntent({
        amount: amountToBePaid,
        currency,
        customerId,
        paymentMethodId,
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
    paymentMethodId,
  }: {
    amount: number;
    currency: string;
    customerId?: string;
    paymentMethodId?: string;
  }) {
    let cus = customerId;

    if (!customerId) {
      const { id } = await this._stripe.customers.create();
      cus = id;
    }
    const { client_secret, id: paymentIntent } = paymentMethodId
      ? await this._stripe.paymentIntents
          .create({
            amount: amount * 100,
            currency,
            customer: cus,
            payment_method: paymentMethodId,
          })
          .catch((error) => {
            throw new ApiError(
              HTTP.BAD_REQUEST,
              `Erreur lors du paiement: ${error.message}`
            );
          })
      : await this._stripe.paymentIntents
          .create({
            amount: amount * 100,
            currency,
            customer: cus,
          })
          .catch((error) => {
            throw new ApiError(
              HTTP.BAD_REQUEST,
              `Erreur lors du paiement: ${error.message}`
            );
          });

    return { client_secret, paymentIntent, customer: cus };
  }

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

  async attachCustomerToPaymentMethod({
    paymentMethodId,
    customerId,
  }: {
    paymentMethodId: string;
    customerId: string;
  }) {
    await this._stripe.paymentMethods.attach(paymentMethodId, {
      customer: customerId,
    });
  }

  async createRefund({
    paymentIntent,
    amount,
  }: {
    paymentIntent: string;
    amount: number;
  }) {
    return this._stripe.refunds
      .create({
        payment_intent: paymentIntent,
        amount: Math.floor(amount * 100),
      })
      .then((response) => {
        const { id, destination_details } = response;
        const { card } =
          destination_details as Stripe.Refund.DestinationDetails;
        const { reference } = card as Stripe.Refund.DestinationDetails.Card;
        const acquirerReferenceNumber = reference;

        return { id, acquirerReferenceNumber };
      })
      .catch((error) => {
        logger.error("Failed refunding: \n" + error);
      });
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

  async createConnectedAccount({
    email,
    name,
  }: {
    email: string;
    name: string;
  }) {
    const { id: connectedAccount } = await this._stripe.accounts.create({
      type: "express",
      country: "AE", // TODO: Change this CA
      email,
      business_type: "individual",
      capabilities: {
        transfers: { requested: true },
      },
      business_profile: {
        name,
      },
    }).catch((error) => {
      throw new ApiError(
        HTTP.BAD_REQUEST,
        `Erreur lors de la création du compte: ${error.message}`
      );
    });

    const { accountCompletionLink, accountLinkExpiresAt } =
      await this.createAccountLink(connectedAccount);

    return { connectedAccount, accountCompletionLink, accountLinkExpiresAt };
  }

  async createAccountLink(accountId: string) {
    const { url: accountCompletionLink, expires_at: accountLinkExpiresAt } =
      await this._stripe.accountLinks.create({
        account: accountId,
        refresh_url: "https://example.com/reauth",
        return_url: "https://example.com/return",
        type: "account_onboarding",
      });

    return { accountCompletionLink, accountLinkExpiresAt };
  }
}
