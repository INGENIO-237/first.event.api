import { InferSchemaType, model, Schema } from "mongoose";

const reviewSchema = new Schema(
  {
    rating: { type: Number, required: true },
    comment: String,
    user: { type: Schema.Types.ObjectId, required: true, ref: "User" },
  },
  {
    timestamps: true,
    toJSON: {
      virtuals: true,
    },
    toObject: {
      virtuals: true,
    },
    discriminatorKey: "type",
  }
);

export interface IReview extends Document, InferSchemaType<typeof reviewSchema>{}

const Review = model<IReview>("Review", reviewSchema);

export default Review;