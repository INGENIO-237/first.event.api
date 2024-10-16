import { Service } from "typedi";
import ProductRepo from "../../repositories/products/product.repository";
import {
  CreateProductPayload,
  GetProductsQuery,
  UpdateProductInput,
} from "../../schemas/products/product.schema";
import Product from "../../models/products/product.model";
import CloudinaryServices from "../utils/cloudinary.services";

@Service()
export default class ProductServices {
  constructor(
    private readonly productRepo: ProductRepo,
    private readonly cloudinary: CloudinaryServices
  ) {}

  async createProduct(product: CreateProductPayload) {
    return await this.productRepo.createProduct(product);
  }

  async getProducts(query: GetProductsQuery) {
    return await this.productRepo.getProducts(query);
  }

  async updateProduct({
    productId,
    update,
    organizer,
  }: {
    productId: string;
    update: UpdateProductInput["body"];
    organizer: string;
  }) {
    const product = await Product.isOwner(productId, organizer);

    await this.productRepo.updateProduct({ productId, update });

    await this.cloudinary.deleteResource(product.image.publicId as string);
  }
}
