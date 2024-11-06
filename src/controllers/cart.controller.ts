import { Request, Response } from "express";
import { Service } from "typedi";
import CartServices from "../services/cart.services";
import HTTP from "../utils/constants/http.responses";
import { AddCartItem, RemoveCartItem } from "../schemas/cart.schemas";
import { ICart } from "../models/cart.model";

@Service()
export default class CartController {
  constructor(private service: CartServices) {}

  async getCart(req: Request, res: Response) {
    const { id } = (req as any).user;

    const cart = await this.service.getCart(id);

    return res.status(HTTP.OK).json(cart);
  }

  async addItem(req: Request<{}, {}, AddCartItem["body"]>, res: Response) {
    const { id } = (req as any).user;

    const cart = await this.service.addItem(id as string, req.body);

    return res.status(HTTP.OK).json(cart);
  }

  async removeItem(req: Request<RemoveCartItem["params"]>, res: Response) {
    const { id } = (req as any).user;

    const cart = await this.service.removeItem(
      id as string,
      req.params.product
    );

    return res.status(HTTP.OK).json(cart);
  }

  async clearCart(req: Request, res: Response) {
    const { id } = (req as any).user;

    const cart = await this.service.clearCart(id as string);

    return res.status(HTTP.OK).json(cart);
  }
}
