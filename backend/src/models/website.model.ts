import mongoose, { Schema, type Document, type Model } from "mongoose";

export type WebsiteStatus = "active" | "archived";

export interface IWebsite extends Document {
  userId: mongoose.Types.ObjectId;
  name: string;
  url?: string;
  description?: string;
  status: WebsiteStatus;
  createdAt: Date;
  updatedAt: Date;
}

const websiteSchema = new Schema<IWebsite>(
  {
    userId: { type: Schema.Types.ObjectId, ref: "User", required: true, index: true },
    name: { type: String, required: true, trim: true, maxlength: 80 },
    url: { type: String, required: false, trim: true },
    description: { type: String, required: false, trim: true, maxlength: 500 },
    status: { type: String, required: true, enum: ["active", "archived"], default: "active" },
  },
  { timestamps: true, collection: "websites" }
);

websiteSchema.index({ userId: 1, name: 1 }, { unique: true });
websiteSchema.index({ userId: 1, status: 1 });

export const WebsiteModel: Model<IWebsite> =
  (mongoose.models.Website as Model<IWebsite>) ||
  mongoose.model<IWebsite>("Website", websiteSchema);
