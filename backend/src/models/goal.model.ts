import mongoose, { Schema, type Document, type Model } from "mongoose";

export type GoalStatus = "active" | "archived";
export type GoalDistributionType = "same" | "custom";

export interface IGoalDay {
  date: Date;
  goal: number;
}

export interface IGoalWallet {
  walletId: mongoose.Types.ObjectId;
  weeklyGoal: number;
  days: IGoalDay[];
}

export interface IGoalSnapshot {
  totalWeeklyGoal: number;
  totalWeeklyProgress: number;
  remaining: number;
  percentage: number;
  status: string;
  streak: number;
  bestWallet: { walletId: string; walletName: string; progress: number; percentage: number } | null;
  walletProgress: Array<{
    walletId: string;
    walletName: string;
    weeklyGoal: number;
    weeklyProgress: number;
    remaining: number;
    percentage: number;
    status: string;
  }>;
  days: Array<{
    date: string;
    goal: number;
    progress: number;
    percentage: number;
    status: string;
  }>;
  deposits: number;
  calculatedAt: Date;
}

export interface IGoal extends Document {
  userId: mongoose.Types.ObjectId;
  name: string;
  status: GoalStatus;
  startDate: Date;
  endDate: Date;
  distributionType: GoalDistributionType;
  totalWeeklyGoal: number;
  wallets: IGoalWallet[];
  archivedAt?: Date;
  snapshot?: IGoalSnapshot;
  createdAt: Date;
  updatedAt: Date;
}

const goalDaySchema = new Schema<IGoalDay>(
  {
    date: { type: Date, required: true },
    goal: { type: Number, required: true, min: 0 },
  },
  { _id: false }
);

const goalWalletSchema = new Schema<IGoalWallet>(
  {
    walletId: { type: Schema.Types.ObjectId, required: true },
    weeklyGoal: { type: Number, required: true, min: 0 },
    days: { type: [goalDaySchema], required: true },
  },
  { _id: false }
);

const goalSnapshotSchema = new Schema<IGoalSnapshot>(
  {
    totalWeeklyGoal: { type: Number, required: true },
    totalWeeklyProgress: { type: Number, required: true },
    remaining: { type: Number, required: true },
    percentage: { type: Number, required: true },
    status: { type: String, required: true },
    streak: { type: Number, required: true },
    bestWallet: {
      type: {
        walletId: { type: String, required: true },
        walletName: { type: String, required: true },
        progress: { type: Number, required: true },
        percentage: { type: Number, required: true },
      },
      required: false,
    },
    walletProgress: [
      {
        walletId: { type: String, required: true },
        walletName: { type: String, required: true },
        weeklyGoal: { type: Number, required: true },
        weeklyProgress: { type: Number, required: true },
        remaining: { type: Number, required: true },
        percentage: { type: Number, required: true },
        status: { type: String, required: true },
      },
    ],
    days: [
      {
        date: { type: String, required: true },
        goal: { type: Number, required: true },
        progress: { type: Number, required: true },
        percentage: { type: Number, required: true },
        status: { type: String, required: true },
      },
    ],
    deposits: { type: Number, required: true },
    calculatedAt: { type: Date, required: true },
  },
  { _id: false }
);

const goalSchema = new Schema<IGoal>(
  {
    userId: { type: Schema.Types.ObjectId, ref: "User", required: true, index: true },
    name: { type: String, required: true, trim: true, maxlength: 80 },
    status: {
      type: String,
      required: true,
      enum: ["active", "archived"],
      default: "active",
    },
    startDate: { type: Date, required: true },
    endDate: { type: Date, required: true },
    distributionType: {
      type: String,
      required: true,
      enum: ["same", "custom"],
      default: "same",
    },
    totalWeeklyGoal: { type: Number, required: true, min: 0 },
    wallets: { type: [goalWalletSchema], required: true },
    archivedAt: { type: Date, required: false },
    snapshot: { type: goalSnapshotSchema, required: false },
  },
  { timestamps: true, collection: "goals" }
);

goalSchema.index({ userId: 1, status: 1 });
goalSchema.index({ userId: 1, startDate: -1 });

export const GoalModel: Model<IGoal> =
  (mongoose.models.Goal as Model<IGoal>) || mongoose.model<IGoal>("Goal", goalSchema);
