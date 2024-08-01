import { Service } from "typedi";
import UserServices from "../services/user.services";
import { Request, Response } from "express";
import { RegisterUser } from "../schemas/user.schemas";
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
}
