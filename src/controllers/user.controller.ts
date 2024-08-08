import { Service } from "typedi";
import UserServices from "../services/user.services";
import { Request, Response } from "express";
import {
  GeneralInfo,
  RegisterUser,
  UpdateAddresses,
  UpdateCredentials,
  UpdateInterests,
} from "../schemas/user.schemas";
import HTTP from "../utils/constants/http.responses";

@Service()
export default class UserController {
  constructor(private service: UserServices) {}

  async registerUser(
    req: Request<{}, {}, RegisterUser["body"]>,
    res: Response
  ) {
    const user = await this.service.registerUser(req.body);

    return res.status(HTTP.CREATED).json(user);
  }

  // TODO: Pass down filters for more precise results
  async getUsers(req: Request, res: Response) {
    const users = await this.service.getUsers();

    return res.status(HTTP.OK).json(users);
  }

  async updateGeneralInfo(
    req: Request<{}, {}, GeneralInfo["body"]>,
    res: Response
  ) {
    const { id } = (req as any).user;
    await this.service.updateGeneralInfo(id as string, req.body);

    return res.sendStatus(HTTP.OK);
  }

  async updateCredentials(
    req: Request<{}, {}, UpdateCredentials["body"]>,
    res: Response
  ) {
    const { id } = (req as any).user;
    await this.service.updateCredentials(id as string, req.body);

    return res.sendStatus(HTTP.OK);
  }

  // TODO: Make sure two or more interests don't have the same keys
  async updateInterests(
    req: Request<{}, {}, UpdateInterests["body"]>,
    res: Response
  ) {
    const { id } = (req as any).user;
    await this.service.updateInterests(id as string, req.body);

    return res.sendStatus(HTTP.OK);
  }

  // TODO: Change addresses' model from array to object: addresses: { shipping: object, billing: object, professional: object }
  async updateAddresses(
    req: Request<{}, {}, UpdateAddresses["body"]>,
    res: Response
  ) {
    const { id } = (req as any).user;
    await this.service.updateAddresses(id as string, req.body);

    return res.sendStatus(HTTP.OK);
  }
}
