import type { Request, Response, NextFunction } from "express";
import { AppError } from "../utils/app-error.js";
import * as walletService from "../services/wallet.service.js";
import type {
  CreateWalletBody,
  UpdateWalletBody,
  ListWalletsQuery,
  WalletIdParams,
} from "../schemas/wallet.schema.js";

export async function createWallet(
  req: Request<unknown, unknown, CreateWalletBody>,
  res: Response,
  next: NextFunction
): Promise<void> {
  try {
    const userId = req.user?.id;
    if (!userId) throw new AppError(401, "UNAUTHORIZED", "Authentication required");
    const data = await walletService.createWallet(userId, req.body);
    res.status(201).json({ data });
  } catch (err) {
    next(err);
  }
}

export async function listWallets(req: Request, res: Response, next: NextFunction): Promise<void> {
  try {
    const userId = req.user?.id;
    if (!userId) throw new AppError(401, "UNAUTHORIZED", "Authentication required");
    const result = await walletService.listWallets(
      userId,
      req.query as unknown as ListWalletsQuery
    );
    res.status(200).json(result);
  } catch (err) {
    next(err);
  }
}

export async function getWallet(
  req: Request<WalletIdParams>,
  res: Response,
  next: NextFunction
): Promise<void> {
  try {
    const userId = req.user?.id;
    if (!userId) throw new AppError(401, "UNAUTHORIZED", "Authentication required");
    const data = await walletService.getWallet(userId, req.params.walletId);
    res.status(200).json({ data });
  } catch (err) {
    next(err);
  }
}

export async function updateWallet(
  req: Request<WalletIdParams, unknown, UpdateWalletBody>,
  res: Response,
  next: NextFunction
): Promise<void> {
  try {
    const userId = req.user?.id;
    if (!userId) throw new AppError(401, "UNAUTHORIZED", "Authentication required");
    const data = await walletService.updateWallet(userId, req.params.walletId, req.body);
    res.status(200).json({ data });
  } catch (err) {
    next(err);
  }
}

export async function archiveWallet(
  req: Request<WalletIdParams>,
  res: Response,
  next: NextFunction
): Promise<void> {
  try {
    const userId = req.user?.id;
    if (!userId) throw new AppError(401, "UNAUTHORIZED", "Authentication required");
    const data = await walletService.archiveWallet(userId, req.params.walletId);
    res.status(200).json({ data });
  } catch (err) {
    next(err);
  }
}

export async function deactivateWallet(
  req: Request<WalletIdParams>,
  res: Response,
  next: NextFunction
): Promise<void> {
  try {
    const userId = req.user?.id;
    if (!userId) throw new AppError(401, "UNAUTHORIZED", "Authentication required");
    const data = await walletService.deactivateWallet(userId, req.params.walletId);
    res.status(200).json({ data });
  } catch (err) {
    next(err);
  }
}

export async function activateWallet(
  req: Request<WalletIdParams>,
  res: Response,
  next: NextFunction
): Promise<void> {
  try {
    const userId = req.user?.id;
    if (!userId) throw new AppError(401, "UNAUTHORIZED", "Authentication required");
    const data = await walletService.activateWallet(userId, req.params.walletId);
    res.status(200).json({ data });
  } catch (err) {
    next(err);
  }
}

export async function deleteWallet(
  req: Request<WalletIdParams>,
  res: Response,
  next: NextFunction
): Promise<void> {
  try {
    const userId = req.user?.id;
    if (!userId) throw new AppError(401, "UNAUTHORIZED", "Authentication required");
    await walletService.deleteWallet(userId, req.params.walletId);
    res.status(204).send();
  } catch (err) {
    next(err);
  }
}
