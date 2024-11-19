import { Request, Response } from "express";
import { Service } from "typedi";
import { CreateFollowing, GetFollowings } from "../schemas/following.schemas";
import FollowingServices from "../services/following.services";
import HTTP from "../utils/constants/http.responses";

@Service()
export default class FollowingController {
  constructor(private readonly followingServices: FollowingServices) {}

  async create(req: Request<{}, {}, CreateFollowing["body"]>, res: Response) {
    const following = await this.followingServices.createFollowing({
      ...req.body,
      user: (req as any).user,
    });

    return res.status(HTTP.CREATED).json(following);
  }

  async findAll(
    req: Request<{}, {}, {}, GetFollowings["query"]>,
    res: Response
  ) {
    const followings = await this.followingServices.getFollowings({
      query: req.query,
      user: (req as any).user,
    });

    return res.status(HTTP.OK).json(followings);
  }

  async delete(req: Request, res: Response) {
    const following = await this.followingServices.deleteFollowing({
      id: req.params.id,
      user: (req as any).user,
    });

    return res.status(HTTP.OK).json(following);
  }
}
