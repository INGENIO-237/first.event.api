import { Schema, model, Types, InferSchemaType } from "mongoose";
import { getSlug } from "../../utils/utilities";

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
      enum: ["active", "inactive"],
      default: "active",
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

export interface IProduct
  extends Document,
    InferSchemaType<typeof productSchema> {}

const Product = model<IProduct>("Product", productSchema);

export default Product;
