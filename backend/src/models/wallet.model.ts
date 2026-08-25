import mongoose, { Schema, type Document, type Model } from "mongoose";

export type WalletType = "exchange" | "personal" | "hardware" | "other";
export type WalletStatus = "active" | "inactive" | "archived";

export interface IWallet extends Document {
  userId: mongoose.Types.ObjectId;
  name: string;
  type: WalletType;
  status: WalletStatus;
  color?: string;
  description?: string;
  createdAt: Date;
  updatedAt: Date;
}

const walletSchema = new Schema<IWallet>(
  {
    userId: { type: Schema.Types.ObjectId, ref: "User", required: true, index: true },
    name: { type: String, required: true, trim: true, maxlength: 80 },
    type: { type: String, required: true, enum: ["exchange", "personal", "hardware", "other"] },
    status: {
      type: String,
      required: true,
      enum: ["active", "inactive", "archived"],
      default: "active",
    },
    color: { type: String, required: false, trim: true },
    description: { type: String, required: false, trim: true, maxlength: 500 },
  },
  { timestamps: true, collection: "wallets" }
);

walletSchema.index({ userId: 1, name: 1 }, { unique: true });
walletSchema.index({ userId: 1, status: 1 });
walletSchema.index({ userId: 1, type: 1 });

export const WalletModel: Model<IWallet> =
  (mongoose.models.Wallet as Model<IWallet>) || mongoose.model<IWallet>("Wallet", walletSchema);
