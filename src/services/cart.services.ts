import { Service } from "typedi";
import CartRepo from "../repositories/cart.repository";
import { CartItem, PRODUCT_STATUS } from "../utils/constants/common";
import ProductServices from "./products/product.services";
import { IProduct } from "../models/products/product.model";
import ApiError from "../utils/errors/errors.base";
import HTTP from "../utils/constants/http.responses";
import { ICart } from "../models/cart.model";

@Service()
export default class CartServices {
  constructor(
    private readonly cartRepository: CartRepo,
    private readonly productService: ProductServices
  ) {}

  async createCart(userId: string) {
    return await this.cartRepository.createCart(userId);
  }

  async getCart(userId: string) {
    return await this.cartRepository.getCart(userId);
  }

  async addItem(userId: string, item: CartItem) {
    const { product } = item;

    const { status } = (await this.productService.getProduct({
      productId: product,
    })) as IProduct;

    if (status == PRODUCT_STATUS.UNAVAILABLE) {
      throw new ApiError(HTTP.BAD_REQUEST, "Produit non disponible");
    }

    const cart = (await this.getCart(userId)) as ICart;

    const { _id: cartId, items } = cart;

    const existingProd = items.find((itm) => itm.product._id.toString() == product);

    if (existingProd) {
      return await this.cartRepository.updateProductQuantity(
        cartId as string,
        product,
        item.quantity
      );
    }

    return await this.cartRepository.addItem(cartId as string, item);
  }

  async removeItem(userId: string, itemId: string) {
    const { _id: cartId } = (await this.getCart(userId)) as ICart;

    return await this.cartRepository.removeItem(cartId as string, itemId);
  }

  async clearCart(userId: string) {
    const { _id: cartId } = (await this.getCart(userId)) as ICart;

    return await this.cartRepository.clearCart(cartId as string);
  }

  async deleteCart(userId: string) {
    const { _id: cartId } = (await this.getCart(userId)) as ICart;

    return await this.cartRepository.deleteCart(cartId as string);
  }
}
