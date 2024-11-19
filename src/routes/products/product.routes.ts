import "reflect-metadata";

import { Router } from "express";
import Container from "typedi";
import MulterServices from "../../services/utils/multer.services";
import {
  createProductSchema,
  getProductsSchema,
  updateProductSchema,
} from "../../schemas/products/product.schema";
import validate from "../../middlewares/validate.request";
import { tryCatch } from "../../utils/errors/errors.utlis";
import { isLoggedIn } from "../../middlewares/auth";
import {
  isValidOrganizer,
  validateSubscription,
} from "../../middlewares/professionals";
import { imageUploader } from "../../middlewares/cloudinary";
import ProductController from "../../controllers/products/product.controller";

const ProductsRouter = Router();

const controller = Container.get(ProductController);
const multer = Container.get(MulterServices);

const uploader = multer.uploader;

ProductsRouter.get(
  "",
  validate(getProductsSchema),
  tryCatch(controller.getProducts.bind(controller))
);

ProductsRouter.post(
  "",
  isLoggedIn,
  isValidOrganizer,
  validateSubscription,
  uploader.single("image"),
  imageUploader,
  validate(createProductSchema),
  tryCatch(controller.createProduct.bind(controller))
);

ProductsRouter.put(
  "/:product",
  isLoggedIn,
  isValidOrganizer,
  uploader.single("image"),
  imageUploader,
  validate(updateProductSchema),
  tryCatch(controller.updateProduct.bind(controller))
);

ProductsRouter.delete(
  "/:product",
  isLoggedIn,
  isValidOrganizer,
  tryCatch(controller.deleteProduct.bind(controller))
);

export default ProductsRouter;
