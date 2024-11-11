import { InferSchemaType, Schema, Types } from "mongoose";
import Review, { IReview } from "./review.model";
import Organizer from "../professionals/organizer.model";

const organizerReviewSchema = new Schema({
  organizer: {
    type: Schema.Types.ObjectId,
    ref: "Organizer",
    required: true,
  },
});

organizerReviewSchema.post("save", async function (doc, next) {
  const reviews = await OrganizerReview.find({
    organizer: new Types.ObjectId(doc.organizer),
  });

  if (reviews.length > 0) {
    const total = reviews.reduce((acc, review) => acc + review.rating, 0);
    const rating = Math.round(total / reviews.length);

    await Organizer.findByIdAndUpdate(doc.organizer, { rating });
  }

  next()
});

export interface IOrganizerReview
  extends IReview,
    InferSchemaType<typeof organizerReviewSchema> {}

const OrganizerReview = Review.discriminator<IOrganizerReview>(
  "OrganizerReview",
  organizerReviewSchema
);

export default OrganizerReview;
