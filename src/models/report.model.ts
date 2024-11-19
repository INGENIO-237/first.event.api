import { Document, InferSchemaType, model, Schema } from "mongoose";
import { REPORT_STATUS } from "../utils/constants/common";

const reportSchema = new Schema(
  {
    user: {
      type: Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },
    reason: {
      type: String,
      required: true,
    },
    description: {
      type: String,
      required: true,
    },
    status: {
      type: String,
      enum: [...Object.values(REPORT_STATUS)],
      default: REPORT_STATUS.PENDING,
    },
    product: {
      type: Schema.Types.ObjectId,
      ref: "Product",
    },
    target: {
      type: Schema.Types.ObjectId,
      ref: "User",
    },
    event: {
      type: Schema.Types.ObjectId,
      ref: "Event",
    },
  },
  {
    timestamps: true,
  }
);

export interface IReport
  extends Document,
    InferSchemaType<typeof reportSchema> {}

const Report = model<IReport>("Report", reportSchema);

export default Report;
