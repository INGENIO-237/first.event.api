import "reflect-metadata";

import Container from "typedi";
import EventEmitter from "node:events";
import { USERS_ACTIONS } from "../utils/constants/user.utils";
import StripeServices from "../services/payments/stripe.services";
import UserRepo from "../repositories/user.repository";

const UsersHooks = new EventEmitter();

const stripe = Container.get(StripeServices);
const userRepo = Container.get(UserRepo);

UsersHooks.on(
  USERS_ACTIONS.USER_REGISTERED,
  async ({ fullname, email }: { fullname: string; email: string }) => {
    const customerId = await stripe.createStripeCustomer({ fullname, email });

    await userRepo.updateUser({ email, stripeCustomer: customerId });
  }
);

export default UsersHooks;
