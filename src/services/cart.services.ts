import { Service } from "typedi";
import CartRepo from "../repositories/cart.repository";
import { CartItem } from "../utils/constants/common";

@Service()
export default class CartServices {
  constructor(private readonly cartRepository: CartRepo) {}

  async createCart(userId: string) {
    return await this.cartRepository.createCart(userId);
  }

  async getCart(userId: string) {
    return await this.cartRepository.getCart(userId);
  }

  async addItem(cartId: string, item: CartItem) {
    return await this.cartRepository.addItem(cartId, item);
  }

  async removeItem(cartId: string, itemId: string) {
    return await this.cartRepository.removeItem(cartId, itemId);
  }

  async clearCart(cartId: string) {
    return await this.cartRepository.clearCart(cartId);
  }

  async deleteCart(cartId: string) {
    return await this.cartRepository.deleteCart(cartId);
  }
}
