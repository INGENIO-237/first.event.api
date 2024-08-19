import { Request, Response } from "express";
import InfluencerServices from "../../services/professionals/influencer.services";
import {
  RegisterInfluencer,
  UpdateInfluencer,
} from "../../schemas/professionals/influencer.schemas";
import HTTP from "../../utils/constants/http.responses";
import { Service } from "typedi";

@Service()
export default class InfluencerController {
  constructor(private service: InfluencerServices) {}

  // TODO: Set a similar route for admin too
  async registerInfluencer( 
    req: Request<{}, {}, RegisterInfluencer["body"]>,
    res: Response
  ) {
    const { id } = (req as any).user;

    const influencer = await this.service.registerInfluencer(
      id as string,
      req.body
    );

    return res.status(HTTP.CREATED).json(influencer);
  }

  async updateInfluencer(
    req: Request<{}, {}, UpdateInfluencer["body"]>,
    res: Response
  ) {
    const { id } = (req as any).user;

    await this.service.updateInfluencer(id as string, req.body);

    return res.sendStatus(HTTP.OK);
  }
}
