import { Service } from "typedi";
import {
  CreateProductPayload,
  GetProductsQuery,
  UpdateProductInput,
} from "../../schemas/products/product.schema";
import Product from "../../models/products/product.model";
import { Types } from "mongoose";

@Service()
export default class ProductRepo {
  async createProduct(product: CreateProductPayload) {
    return await Product.create(product);
  }

  async getProducts(query: GetProductsQuery) {
    return query && Object.keys(query).length > 0
      ? await Product.find({
          $or: [
            { organizer: new Types.ObjectId(query.organizer) },
            { event: new Types.ObjectId(query.event) },
          ],
        }).sort({ createdAt: -1, updatedAt: -1 })
      : await Product.find();
  }

  async getProduct(productId: string) {
    return await Product.findById(productId);
  }

  async updateProduct({
    productId,
    update,
  }: {
    productId: string;
    update: UpdateProductInput["body"];
  }) {
    await Product.findByIdAndUpdate(productId, update);
  }

  async deleteProduct(productId: string) {
    await Product.findByIdAndUpdate(productId, {
      hasBeenDeleted: true,
    });
  }
}
