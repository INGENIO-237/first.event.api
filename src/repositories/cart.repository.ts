import { Service } from "typedi";
import Cart from "../models/cart.model";
import { Types } from "mongoose";
import { CartItem } from "../utils/constants/common";

@Service()
export default class CartRepo {
  async createCart(user: string) {
    return await Cart.create({ user });
  }

  async getCart(user: string) {
    return await Cart.findOne({ user });
  }

  async updateCart(cartId: string, items: CartItem[]) {
    return await Cart.findByIdAndUpdate(cartId, { items }, { new: true });
  }

  async addItem(cartId: string, item: CartItem) {
    return await Cart.findByIdAndUpdate(
      cartId,
      { $push: { items: item } },
      { new: true }
    );
  }

  async removeItem(cartId: string, itemId: string) {
    return await Cart.findByIdAndUpdate(
      cartId,
      { $pull: { items: { _id: new Types.ObjectId(itemId) } } },
      { new: true }
    );
  }

  async deleteCart(cartId: string) {
    return await Cart.findByIdAndDelete(cartId);
  }

  async clearCart(cartId: string) {
    return await Cart.findByIdAndUpdate(cartId, { items: [] }, { new: true });
  }
}
