import { Service } from "typedi";
import ProductRepo from "../../repositories/products/product.repository";
import {
  CreateProductPayload,
  GetProductsQuery,
} from "../../schemas/products/product.schema";

@Service()
export default class ProductServices {
  constructor(private readonly productRepo: ProductRepo) {}

  async createProduct(product: CreateProductPayload) {
    return await this.productRepo.createProduct(product);
  }

  async getProducts(query: GetProductsQuery) {
    return await this.productRepo.getProducts(query);
  }
}
