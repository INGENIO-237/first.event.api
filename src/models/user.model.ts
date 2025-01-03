import { InferSchemaType, model, Schema, Document, Types } from "mongoose";
import { OAUTH_PROVIDER, PROFILE } from "../utils/constants/user.utils";
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
    stripeCustomer: String,
    phones: {
      type: {
        home: String,
        mobile: String,
      },
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
      type: {
        billing: {
          type: {
            content: {
              address: { type: String, required: true },
              country: { type: String, required: true },
              state: { type: String, required: true },
              city: { type: String, required: true },
              zipCode: { type: String, required: true },
            },
            sameAsHome: {
              type: Boolean,
              default: true,
            },
          },
          required: true,
        },
        shipping: {
          type: {
            content: {
              address: { type: String, required: true },
              country: { type: String, required: true },
              state: { type: String, required: true },
              city: { type: String, required: true },
              zipCode: { type: String, required: true },
            },
            sameAsHome: {
              type: Boolean,
              default: true,
            },
          },
          required: true,
        },
      },
    },

    // Professional profile
    professional: {
      type: String,
      enum: [...Object.values(PROFILE)],
    },
    profile: {
      type: Types.ObjectId,
      refPath: "professional",
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
      type: [
        {
          interest: { type: String, required: true },
          tags: { type: [String], required: true },
        },
      ],
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

    // Admin
    isAdmin: {
      type: Boolean,
      default: false,
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
