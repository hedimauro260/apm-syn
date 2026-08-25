import type { Request, Response, NextFunction } from "express";
import { AppError } from "../utils/app-error.js";
import * as walletOpsService from "../services/wallet-operations.service.js";
import type {
  DepositBody,
  WithdrawBody,
  AdjustBody,
  TransferBody,
  WalletIdParams,
} from "../schemas/wallet-operations.schema.js";

export async function depositToWallet(
  req: Request<WalletIdParams, unknown, DepositBody>,
  res: Response,
  next: NextFunction
): Promise<void> {
  try {
    const userId = req.user?.id;
    if (!userId) throw new AppError(401, "UNAUTHORIZED", "Authentication required");
    const data = await walletOpsService.depositToWallet(userId, req.params.walletId, req.body);
    res.status(201).json({ data });
  } catch (err) {
    next(err);
  }
}

export async function withdrawFromWallet(
  req: Request<WalletIdParams, unknown, WithdrawBody>,
  res: Response,
  next: NextFunction
): Promise<void> {
  try {
    const userId = req.user?.id;
    if (!userId) throw new AppError(401, "UNAUTHORIZED", "Authentication required");
    const data = await walletOpsService.withdrawFromWallet(userId, req.params.walletId, req.body);
    res.status(201).json({ data });
  } catch (err) {
    next(err);
  }
}

export async function adjustWallet(
  req: Request<WalletIdParams, unknown, AdjustBody>,
  res: Response,
  next: NextFunction
): Promise<void> {
  try {
    const userId = req.user?.id;
    if (!userId) throw new AppError(401, "UNAUTHORIZED", "Authentication required");
    const data = await walletOpsService.adjustWallet(userId, req.params.walletId, req.body);
    res.status(201).json({ data });
  } catch (err) {
    next(err);
  }
}

export async function transferBetweenWallets(
  req: Request<unknown, unknown, TransferBody>,
  res: Response,
  next: NextFunction
): Promise<void> {
  try {
    const userId = req.user?.id;
    if (!userId) throw new AppError(401, "UNAUTHORIZED", "Authentication required");
    const data = await walletOpsService.transferBetweenWallets(userId, req.body);
    res.status(201).json({ data });
  } catch (err) {
    next(err);
  }
}
