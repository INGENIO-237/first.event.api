import { Service } from "typedi";
import { USERS_ACTIONS } from "../utils/constants/user.utils";
import StripeServices from "../services/payments/stripe.services";
import UserRepo from "../repositories/user.repository";
import EventEmitter from "node:events";
import CartServices from "../services/cart.services";
import { IUser } from "../models/user.model";

@Service()
export default class UsersHooks {
  constructor(
    private stripe: StripeServices,
    private userRepo: UserRepo,
    private cartService: CartServices
  ) {}

  registerListeners(emitter: EventEmitter) {
    emitter.on(
      USERS_ACTIONS.USER_REGISTERED,
      async ({ fullname, email }: { fullname: string; email: string }) => {
        const customerId = await this.stripe.createStripeCustomer({
          fullname,
          email,
        });

        await this.userRepo.updateUser({ email, stripeCustomer: customerId });

        const { _id: userId } = (await this.userRepo.getUser({
          email,
        })) as IUser;

        await this.cartService.createCart(userId as string);
      }
    );
  }
}
