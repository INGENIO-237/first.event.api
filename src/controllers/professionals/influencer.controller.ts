import { Request, Response } from "express";
import InfluencerServices from "../../services/professionals/influencer.services";
import { RegisterInfluencer } from "../../schemas/professionals/influencer.schemas";
import HTTP from "../../utils/constants/http.responses";
import { Service } from "typedi";

@Service()
export default class InfluencerController {
  constructor(private service: InfluencerServices) {}

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
}
