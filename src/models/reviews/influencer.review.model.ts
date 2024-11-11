import { InferSchemaType, Schema, Types } from "mongoose";
import Review, { IReview } from "./review.model";
import Influencer from "../professionals/influencer.model";

const influencerReviewSchema = new Schema({
  influencer: {
    type: Schema.Types.ObjectId,
    ref: "Influencer",
    required: true,
  },
});

influencerReviewSchema.post("save", async function (doc, next) {
  const reviews = await InfluencerReview.find({
    influencer: new Types.ObjectId(doc.influencer),
  });

  if (reviews.length > 0) {
    const total = reviews.reduce((acc, review) => acc + review.rating, 0);
    const rating = Math.round(total / reviews.length);

    await Influencer.findByIdAndUpdate(doc.influencer, { rating });
  }

  next();
});

export interface IInfluencerReview
  extends IReview,
    InferSchemaType<typeof influencerReviewSchema> {}

const InfluencerReview = Review.discriminator<IInfluencerReview>(
  "InfluencerReview",
  influencerReviewSchema
);

export default InfluencerReview;
