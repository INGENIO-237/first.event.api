import { Service } from "typedi";
import {
  CreateProductPayload,
  GetProductsQuery,
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
}
