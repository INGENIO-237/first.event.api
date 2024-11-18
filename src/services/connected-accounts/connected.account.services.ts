import { Service } from "typedi";
import StripeServices from "../payments/stripe.services";
import MailServices from "../utils/mail.services";
import OrganizerServices from "../professionals/organizer.services";
import InfluencerServices from "../professionals/influencer.services";
import UserServices from "../user.services";
import { IUser } from "../../models/user.model";
import { PROFILE } from "../../utils/constants/user.utils";

@Service()
export default class ConnectedAccountServices {
  constructor(
    private readonly stripe: StripeServices,
    private mailService: MailServices,
    private userRepo: UserServices,
    private organizerService: OrganizerServices,
    private influencerService: InfluencerServices
  ) {}

  async createConnectedAccount(email: string, name: string) {
    const { connectedAccount } = await this.stripe.createConnectedAccount({
      email,
      name,
    });

    const { accountCompletionLink, accountLinkExpiresAt } =
      await this.createAccountLink(email, connectedAccount);

    await this.updateProfessional({
      email,
      connectedAccount,
      accountCompletionLink,
      accountLinkExpiresAt,
    });

    // TODO: Send account completion link via email
    return { connectedAccount, accountLinkExpiresAt, accountCompletionLink };
  }

  async createAccountLink(email: string, connectedAccount: string) {
    const { accountCompletionLink, accountLinkExpiresAt } =
      await this.stripe.createAccountLink(connectedAccount);

    await this.updateProfessional({
      email,
      connectedAccount,
      accountCompletionLink,
      accountLinkExpiresAt,
    });

    return { accountCompletionLink, accountLinkExpiresAt };
  }

  private async updateProfessional({
    email,
    connectedAccount,
    ...rest
  }: {
    email?: string;
    connectedAccount?: string;
    accountLinkExpiresAt?: number;
    accountCompletionLink?: string;
  }) {
    const { professional, _id: userId } = (await this.userRepo.getUser({
      email,
    })) as IUser;

    switch (professional as PROFILE) {
      case PROFILE.ORGANIZER:
        await this.organizerService.updateOrganizer(userId as string, {
          connectedAccount,
          ...rest,
          accountLinkExpiresAt: new Date(rest.accountLinkExpiresAt as number),
        });
        break;
      case PROFILE.INFLUENCER:
        await this.influencerService.updateInfluencer(userId as string, {
          connectedAccount,
          ...rest,
          accountLinkExpiresAt: new Date(rest.accountLinkExpiresAt as number),
        });
        break;
      default:
        break;
    }
  }
}
