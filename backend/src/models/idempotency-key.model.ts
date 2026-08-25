import mongoose, { Schema, type Document, type Model } from "mongoose";

export interface IIdempotencyKey extends Document {
  userId: mongoose.Types.ObjectId;
  key: string;
  scope: string;
  requestHash: string;
  transactionId?: mongoose.Types.ObjectId;
  responseStatus: number;
  responseBody: Record<string, unknown>;
  createdAt: Date;
  expiresAt: Date;
}

const idempotencyKeySchema = new Schema<IIdempotencyKey>(
  {
    userId: { type: Schema.Types.ObjectId, ref: "User", required: true, index: true },
    key: { type: String, required: true, trim: true },
    scope: { type: String, required: true, enum: ["WEBSITE_EARNING", "WEBSITE_WITHDRAWAL"] },
    requestHash: { type: String, required: true },
    transactionId: { type: Schema.Types.ObjectId, ref: "Transaction", required: false },
    responseStatus: { type: Number, required: true },
    responseBody: { type: Schema.Types.Mixed, required: true },
    expiresAt: { type: Date, required: true },
  },
  { timestamps: { createdAt: true, updatedAt: false }, collection: "idempotency_keys" }
);

idempotencyKeySchema.index({ userId: 1, key: 1 }, { unique: true });
idempotencyKeySchema.index({ expiresAt: 1 }, { expireAfterSeconds: 0 });

export const IdempotencyKeyModel: Model<IIdempotencyKey> =
  (mongoose.models.IdempotencyKey as Model<IIdempotencyKey>) ||
  mongoose.model<IIdempotencyKey>("IdempotencyKey", idempotencyKeySchema);
