import { Request, Response } from "express";
import OrganizerServices from "../../services/professionals/organizer.services";
import {
  RegisterOrganizer,
//   UpdateOrganizer,
} from "../../schemas/professionals/organizer.schemas";
import HTTP from "../../utils/constants/http.responses";
import { Service } from "typedi";

@Service()
export default class OrganizerController {
  constructor(private service: OrganizerServices) {}

  // TODO: Set a similar route for admin too
  async registerOrganizer(
    req: Request<{}, {}, RegisterOrganizer["body"]>,
    res: Response
  ) {
    const { id } = (req as any).user;

    const organizer = await this.service.registerOrganizer(
      id as string,
      req.body
    );

    return res.status(HTTP.CREATED).json(organizer);
  }

//   async updateOrganizer(
//     req: Request<{}, {}, UpdateOrganizer["body"]>,
//     res: Response
//   ) {
//     const { id } = (req as any).user;

//     await this.service.updateOrganizer(id as string, req.body);
//   }
}
