import mongoose, { Schema, type Document, type Model } from "mongoose";

export interface IUserOnboarding {
  completed: boolean;
  skipped: boolean;
}

export interface IUser extends Document {
  clerkId: string;
  email?: string;
  name?: string;
  imageUrl?: string;
  onboarding?: IUserOnboarding;
  createdAt: Date;
  updatedAt: Date;
}

const userSchema = new Schema<IUser>(
  {
    clerkId: {
      type: String,
      required: true,
      unique: true,
      trim: true,
    },
    email: {
      type: String,
      required: false,
      trim: true,
      lowercase: true,
    },
    name: {
      type: String,
      required: false,
      trim: true,
      maxlength: 100,
    },
    imageUrl: {
      type: String,
      required: false,
      trim: true,
    },
    onboarding: {
      type: {
        completed: { type: Boolean, default: false },
        skipped: { type: Boolean, default: false },
      },
      required: false,
      _id: false,
    },
  },
  {
    timestamps: true,
    collection: "users",
  }
);

export const UserModel: Model<IUser> =
  (mongoose.models.User as Model<IUser>) || mongoose.model<IUser>("User", userSchema);
