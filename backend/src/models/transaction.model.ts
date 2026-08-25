import mongoose, { Schema, type Document, type Model } from "mongoose";

export type TransactionType =
  | "WALLET_DEPOSIT"
  | "WALLET_WITHDRAWAL"
  | "WALLET_TRANSFER"
  | "WALLET_ADJUSTMENT"
  | "WEBSITE_EARNING"
  | "WEBSITE_WITHDRAWAL";

export type ParticipantType = "WALLET" | "WEBSITE" | "EXTERNAL";

export interface ITransactionParticipant {
  type: ParticipantType;
  id?: mongoose.Types.ObjectId;
}

export interface ITransactionAsset {
  externalId: string;
  symbol: string;
  name: string;
}

export interface ITransaction extends Document {
  userId: mongoose.Types.ObjectId;
  type: TransactionType;
  source: ITransactionParticipant;
  destination: ITransactionParticipant;
  asset: ITransactionAsset;
  quantity: number;
  usdValue: number;
  countsTowardGoal: boolean;
  date: Date;
  description?: string;
  createdAt: Date;
  updatedAt: Date;
}

const participantSchema = new Schema<ITransactionParticipant>(
  {
    type: { type: String, required: true, enum: ["WALLET", "WEBSITE", "EXTERNAL"] },
    id: { type: Schema.Types.ObjectId, required: false },
  },
  { _id: false }
);

const assetSchema = new Schema<ITransactionAsset>(
  {
    externalId: { type: String, required: true, trim: true },
    symbol: { type: String, required: true, trim: true, uppercase: true },
    name: { type: String, required: true, trim: true },
  },
  { _id: false }
);

const transactionSchema = new Schema<ITransaction>(
  {
    userId: { type: Schema.Types.ObjectId, ref: "User", required: true, index: true },
    type: {
      type: String,
      required: true,
      enum: [
        "WALLET_DEPOSIT",
        "WALLET_WITHDRAWAL",
        "WALLET_TRANSFER",
        "WALLET_ADJUSTMENT",
        "WEBSITE_EARNING",
        "WEBSITE_WITHDRAWAL",
      ],
    },
    source: { type: participantSchema, required: true },
    destination: { type: participantSchema, required: true },
    asset: { type: assetSchema, required: true },
    quantity: { type: Number, required: true, min: 0 },
    usdValue: { type: Number, required: true, min: 0 },
    countsTowardGoal: { type: Boolean, required: true, default: false },
    date: { type: Date, required: true, index: true },
    description: { type: String, required: false, trim: true, maxlength: 500 },
  },
  { timestamps: true, collection: "transactions" }
);

// Índices Fase 6
transactionSchema.index({ userId: 1, date: -1 });
transactionSchema.index({ userId: 1, type: 1 });
transactionSchema.index({ userId: 1, "source.type": 1, "source.id": 1 });
transactionSchema.index({ userId: 1, "destination.type": 1, "destination.id": 1 });
transactionSchema.index({ userId: 1, "asset.externalId": 1 });

// Índices Fase 16 — balance queries (sem userId leading)
transactionSchema.index({ "source.id": 1, "asset.externalId": 1 });
transactionSchema.index({ "destination.id": 1, "asset.externalId": 1 });

export const TransactionModel: Model<ITransaction> =
  (mongoose.models.Transaction as Model<ITransaction>) ||
  mongoose.model<ITransaction>("Transaction", transactionSchema);
