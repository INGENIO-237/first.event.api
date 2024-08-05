import { InferSchemaType, model, Schema, Document } from "mongoose";
import {
  ADDRESS_TYPE,
  OAUTH_PROVIDER,
  PHONE_TYPE,
} from "../utils/constants/user.utils";
import bcrypt from "bcrypt";
import config from "../config";
import moment from "moment";

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
      type: {
        address: { type: String, required: true },
        country: { type: String, required: true },
        state: { type: String, required: true },
        city: { type: String, required: true },
        zipCode: { type: String, required: true },
      },
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

export interface IUser extends InferSchemaType<typeof userSchema>, Document {
  comparePassword: (password: string) => Promise<boolean>;
}

userSchema.pre<IUser>("save", async function (next) {
  let user = this;

  // Password hashing
  if (user.isModified("password")) {
    const salt = await bcrypt.genSalt(config.SALT);

    const hash = await bcrypt.hash(user.password, salt);

    user.password = hash;
  }

  return next();
});

userSchema.pre("findOneAndUpdate", async function (next) {
  const update = this.getUpdate() as any;

  if (update.password) {
    const salt = await bcrypt.genSalt(config.SALT);
    update.password = await bcrypt.hash(update.password, salt);
  }

  // OtpExpiry setting
  if (update.otp) {
    // Sets otp expiry to 30min from now
    update.otpExpiry = moment(new Date()).add(30, "minutes").toDate();
  }

  this.setUpdate(update);
  next();
});

userSchema.methods.comparePassword = async function (
  candidatePassword: string
) {
  let user = this as IUser;

  return await bcrypt
    .compare(candidatePassword, user.password)
    .catch((error) => false);
};

const User = model<IUser>("User", userSchema);

export default User;
