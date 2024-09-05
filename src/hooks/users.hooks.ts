import { Service } from "typedi";
import { EventEmitter } from "node:events";
import { USERS_ACTIONS } from "../utils/constants/user.utils";
import StripeServices from "../services/payments/stripe.services";
import UserRepo from "../repositories/user.repository";
import IHook from "./hook.interface";

@Service()
export default class UsersHooks implements IHook {
  private _eventEmitter: EventEmitter;

  constructor(private stripe: StripeServices, private userRepo: UserRepo) {
    this._eventEmitter = new EventEmitter();
    this.register(this._eventEmitter);
  }

  getEmitter() {
    return this._eventEmitter;
  }

  emit(event: USERS_ACTIONS, data: any) {
    this._eventEmitter.emit(event, data);
  }

  register(eventEmitter: EventEmitter) {
    eventEmitter.on(
      USERS_ACTIONS.USER_REGISTERED,
      async ({ fullname, email }: { fullname: string; email: string }) => {
        const customerId = await this.stripe.createStripeCustomer({
          fullname,
          email,
        });

        await this.userRepo.updateUser({ email, stripeCustomer: customerId });
      }
    );
  }
}
