import { Service } from "typedi";
import ProductServices from "../../services/products/product.services";
import { Request, Response } from "express";
import {
  CreateProductInput,
  GetProductsQuery,
  UpdateProductInput,
} from "../../schemas/products/product.schema";
import { IOrganizer } from "../../models/professionals/organizer.model";
import HTTP from "../../utils/constants/http.responses";
import { Image } from "../../utils/constants/common";

@Service()
export default class ProductController {
  constructor(private readonly productServices: ProductServices) {}

  async createProduct(
    req: Request<
      {},
      {},
      CreateProductInput["body"] & {
        image: Image;
      }
    >,
    res: Response
  ) {
    const organizer = ((req as any).organizer as IOrganizer)._id as string;

    const product = await this.productServices.createProduct({
      organizer,
      ...req.body,
    });

    res.status(HTTP.CREATED).json(product);
  }

  async getProducts(req: Request<{}, {}, {}, GetProductsQuery>, res: Response) {
    const products = await this.productServices.getProducts(req.query);

    res.status(HTTP.OK).json(products);
  }

  async updateProduct(
    req: Request<
      UpdateProductInput["params"],
      {},
      UpdateProductInput["body"] & {
        image: Image;
      }
    >,
    res: Response
  ) {
    await this.productServices.updateProduct({
      productId: req.params.product,
      update: req.body,
      organizer: ((req as any).organizer as IOrganizer)._id as string,
    });

    res.status(HTTP.OK).json({ message: "Produit mis à jour avec succès" });
  }

  async deleteProduct(
    req: Request<UpdateProductInput["params"]>,
    res: Response
  ) {
    await this.productServices.deleteProduct({
      productId: req.params.product,
      organizer: ((req as any).organizer as IOrganizer)._id as string,
    });

    res.status(HTTP.OK).json({ message: "Produit supprimé avec succès" });
  }
}
