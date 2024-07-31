import { InferSchemaType, model, Schema, Types } from "mongoose";
import {
  ADDRESS_TYPE,
  OAUTH_PROVIDER,
  PHONE_TYPE,
} from "../utils/constants/user.utils";

const userSchema = new Schema(
  {
    email: {
      type: String,
      required: true,
      unique: true,
    },
    password: {
      type: String,
      required: true,
    },
    image: {
      type: {
        url: { type: String, required: true },
        publicId: String,
      },
    },
    firstname: {
      type: String,
      required: true,
    },
    lastname: {
      type: String,
      required: true,
    },
    phones: {
      type: [
        {
          cat: { type: String, enum: PHONE_TYPE, required: true },
          value: { type: Number, required: true },
        },
      ],
      default: [],
    },
    home: {
      address: { type: String, required: true },
      country: { type: String, required: true },
      state: { type: String, required: true },
      city: { type: String, required: true },
      zipCode: { type: String, required: true },
    },
    addresses: {
      type: [
        {
          cat: { type: String, enum: ADDRESS_TYPE, required: true },
          content: {
            type: {
              address: { type: String, required: true },
              country: { type: String, required: true },
              state: { type: String, required: true },
              city: { type: String, required: true },
              zipCode: { type: String, required: true },
            },
          },
          sameAsHome: {
            type: Boolean,
            default: true,
          },
        },
      ],
      default: [],
    },

    // Utility fields
    otp: Number,
    otpExpiry: Date,
    isVerified: {
      type: Boolean,
      default: false,
    },
    hasBeenDeleted: {
      type: Boolean,
      default: false,
    },
    interests: {
      type: [{ interest: { type: String, required: true }, tags: [] }],
      default: [],
    },

    // OAuth
    oAuth: {
      type: {
        oAuthId: String,
        oAuthProvider: {
          type: String,
          enum: OAUTH_PROVIDER,
        },
      },
    },
  },
  {
    timestamps: true,
  }
);

export type IUser = InferSchemaType<typeof userSchema> & {
  _id: Types.ObjectId;
};

const User = model<IUser>("User", userSchema);

export default User;
