import { Service } from "typedi";
import { RegisterPaymentMethod } from "../../schemas/payments/methods.schemas";
import PaymentMethodRepo from "../../repositories/payments/methods.repository";
import StripeServices from "./stripe.services";
import UserServices from "../user.services";
import { IUser } from "../../models/user.model";

@Service()
export default class PaymentMethodService {
  constructor(
    private repository: PaymentMethodRepo,
    private stripe: StripeServices,
    private userService: UserServices
  ) {}

  async registerPaymentMethod(
    payload: RegisterPaymentMethod["body"] & { user: string }
  ) {
    const { paymentMethodId, user } = payload;

    const { stripeCustomer } = (await this.userService.getUser({
      userId: user,
    })) as IUser;

    await this.stripe.attachCustomerToPaymentMethod({
      paymentMethodId,
      customerId: stripeCustomer as string,
    });

    return await this.repository.registerPaymentMethod(payload);
  }

  async getPaymentMethod({
    pmId,
    stripePmId,
  }: {
    pmId?: string;
    stripePmId?: string;
  }) {
    return await this.repository.getPaymentMethod({ pmId, stripePmId });
  }

  async getUserPaymentMethods(userId: string) {
    return await this.repository.getUserPaymentMethods(userId);
  }
}