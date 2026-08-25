import mongoose, { Schema, type Document, type Model } from "mongoose";

export interface IWebsiteAssetBalance extends Document {
  websiteId: mongoose.Types.ObjectId;
  assetExternalId: string;
  balance: number;
  createdAt: Date;
  updatedAt: Date;
}

const websiteAssetBalanceSchema = new Schema<IWebsiteAssetBalance>(
  {
    websiteId: { type: Schema.Types.ObjectId, ref: "Website", required: true, index: true },
    assetExternalId: { type: String, required: true, trim: true },
    balance: { type: Number, required: true, default: 0 },
  },
  { timestamps: true, collection: "website_asset_balances" }
);

websiteAssetBalanceSchema.index({ websiteId: 1, assetExternalId: 1 }, { unique: true });

export const WebsiteAssetBalanceModel: Model<IWebsiteAssetBalance> =
  (mongoose.models.WebsiteAssetBalance as Model<IWebsiteAssetBalance>) ||
  mongoose.model<IWebsiteAssetBalance>("WebsiteAssetBalance", websiteAssetBalanceSchema);
