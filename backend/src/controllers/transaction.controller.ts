import type { Request, Response, NextFunction } from "express";
import { AppError } from "../utils/app-error.js";
import * as transactionService from "../services/transaction.service.js";
import type {
  CreateTransactionBody,
  UpdateTransactionBody,
  ListTransactionsQuery,
  TransactionIdParams,
} from "../schemas/transaction.schema.js";

export async function createTransaction(
  req: Request<unknown, unknown, CreateTransactionBody>,
  res: Response,
  next: NextFunction
): Promise<void> {
  try {
    const userId = req.user?.id;
    if (!userId) throw new AppError(401, "UNAUTHORIZED", "Authentication required");
    const data = await transactionService.createTransaction(userId, req.body);
    res.status(201).json({ data });
  } catch (err) {
    next(err);
  }
}

export async function listTransactions(
  req: Request,
  res: Response,
  next: NextFunction
): Promise<void> {
  try {
    const userId = req.user?.id;
    if (!userId) throw new AppError(401, "UNAUTHORIZED", "Authentication required");
    const result = await transactionService.listTransactions(
      userId,
      req.query as unknown as ListTransactionsQuery
    );
    res.status(200).json(result);
  } catch (err) {
    next(err);
  }
}

export async function getTransaction(
  req: Request<TransactionIdParams>,
  res: Response,
  next: NextFunction
): Promise<void> {
  try {
    const userId = req.user?.id;
    if (!userId) throw new AppError(401, "UNAUTHORIZED", "Authentication required");
    const data = await transactionService.getTransaction(userId, req.params.transactionId);
    res.status(200).json({ data });
  } catch (err) {
    next(err);
  }
}

export async function updateTransaction(
  req: Request<TransactionIdParams, unknown, UpdateTransactionBody>,
  res: Response,
  next: NextFunction
): Promise<void> {
  try {
    const userId = req.user?.id;
    if (!userId) throw new AppError(401, "UNAUTHORIZED", "Authentication required");
    const data = await transactionService.updateTransaction(
      userId,
      req.params.transactionId,
      req.body
    );
    res.status(200).json({ data });
  } catch (err) {
    next(err);
  }
}

export async function deleteTransaction(
  req: Request<TransactionIdParams>,
  res: Response,
  next: NextFunction
): Promise<void> {
  try {
    const userId = req.user?.id;
    if (!userId) throw new AppError(401, "UNAUTHORIZED", "Authentication required");
    await transactionService.deleteTransaction(userId, req.params.transactionId);
    res.status(204).send();
  } catch (err) {
    next(err);
  }
}
