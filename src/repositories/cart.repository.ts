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
    return await Cart.findOne({ user })
      .populate("items.product", "title price image")
      .select("-__v");
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
      { $pull: { items: { product: new Types.ObjectId(itemId) } } },
      { new: true }
    );
  }

  async updateProductQuantity(
    cartId: string,
    itemId: string,
    quantity: number
  ) {
    return await Cart.findOneAndUpdate(
      { _id: cartId, "items.product": new Types.ObjectId(itemId) },
      { $set: { "items.$.quantity": quantity } },
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
