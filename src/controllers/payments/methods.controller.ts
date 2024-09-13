import { Request, Response } from "express";
import { Service } from "typedi";
import { RegisterPaymentMethod } from "../../schemas/payments/methods.schemas";
import PaymentMethodService from "../../services/payments/methods.services";
import HTTP from "../../utils/constants/http.responses";

@Service()
export default class PaymentMethodController {
  constructor(private service: PaymentMethodService) {}

  async registerPaymentMethod(
    req: Request<{}, {}, RegisterPaymentMethod["body"]>,
    res: Response
  ) {
    const { id } = (req as any).user;

    const pm = await this.service.registerPaymentMethod({
      ...req.body,
      user: id as string,
    });

    return res.status(HTTP.CREATED).json(pm);
  }
}
