import { Schema, model, Types, InferSchemaType, Model } from "mongoose";
import { getSlug } from "../../utils/utilities";
import ApiError from "../../utils/errors/errors.base";
import HTTP from "../../utils/constants/http.responses";

const productSchema = new Schema(
  {
    title: {
      type: String,
      required: true,
    },
    price: {
      type: Number,
      required: true,
    },
    description: String,
    image: {
      type: {
        url: { type: String, required: true },
        publicId: String,
      },
      required: true,
    },
    organizer: {
      type: Types.ObjectId,
      ref: "Organizer",
      required: true,
    },
    event: {
      type: Types.ObjectId,
      ref: "Event",
    },
    status: {
      type: String,
      enum: ["available", "unavailable"],
      default: "available",
    },
  },
  {
    timestamps: true,
    toJSON: { virtuals: true },
    toObject: { virtuals: true },
  }
);

productSchema.virtual("slug").get(function () {
  return getSlug(this.title);
});

productSchema.statics.isOwner = async function (
  productId: string,
  organizerId: string
) {
  const product = await this.findById(productId);

  if (!product) throw new ApiError(HTTP.BAD_REQUEST, "Produit inéxistant");

  if (product.organizer.toString() !== organizerId.toString())
    throw new ApiError(
      HTTP.UNAUTHORIZED,
      "Vous n'êtes pas le créateur de ce produit"
    );

  return product;
};

export interface IProduct
  extends Document,
    InferSchemaType<typeof productSchema> {}

interface ProductModel extends Model<IProduct> {
  isOwner: (productId: string, organizerId: string) => Promise<IProduct>;
}

const Product = model<IProduct, ProductModel>("Product", productSchema);

export default Product;