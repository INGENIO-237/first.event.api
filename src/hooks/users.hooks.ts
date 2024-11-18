import EventEmitter from "node:events";
import { Service } from "typedi";
import { IUser } from "../models/user.model";
import UserRepo from "../repositories/user.repository";
import CartServices from "../services/cart.services";
import StripeServices from "../services/payments/stripe.services";
import InfluencerServices from "../services/professionals/influencer.services";
import OrganizerServices from "../services/professionals/organizer.services";
import { PROFILE, USERS_ACTIONS } from "../utils/constants/user.utils";

@Service()
export default class UsersHooks {
  constructor(
    private stripe: StripeServices,
    private cartService: CartServices,
    private userRepo: UserRepo,
    private organizerService: OrganizerServices,
    private influencerService: InfluencerServices
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

    emitter.on(
      USERS_ACTIONS.USER_PROFESSIONAL_PROFILE_CREATED,
      async ({ email, name }: { email: string; name: string }) => {
        await this.stripe.createConnectedAccount({
          email,
          name,
        });
      }
    );

    emitter.on(
      USERS_ACTIONS.ACCOUNT_EXTERNAL_ACCOUNT_UPDATED,
      async (connectedAccount) => {
        const influencer =
          await this.influencerService.getInfluencerByCAccountId(
            connectedAccount
          );

        const organizer = await this.organizerService.getOrganizerByCAccountId(
          connectedAccount
        );

        if (influencer) {
          await this.influencerService.updateInfluencer(
            influencer.user as string,
            {
              connectedAccountCompleted: true,
            }
          );
        }

        if (organizer) {
          await this.organizerService.updateOrganizer(
            organizer.user as string,
            {
              connectedAccountCompleted: true,
            }
          );
        }
      }
    );
  }
}
