import { Router } from "express";
import { authenticateAndSync } from "../middlewares/auth.middleware.js";
import { validate } from "../middlewares/validate.js";
import {
  createTransactionSchema,
  updateTransactionSchema,
  transactionIdParamsSchema,
  listTransactionsQuerySchema,
} from "../schemas/transaction.schema.js";
import * as transactionController from "../controllers/transaction.controller.js";

const router = Router();

router.post(
  "/",
  authenticateAndSync,
  validate({ body: createTransactionSchema }),
  transactionController.createTransaction
);
router.get(
  "/",
  authenticateAndSync,
  validate({ query: listTransactionsQuerySchema }),
  transactionController.listTransactions
);
router.get(
  "/:transactionId",
  authenticateAndSync,
  validate({ params: transactionIdParamsSchema }),
  transactionController.getTransaction
);
router.patch(
  "/:transactionId",
  authenticateAndSync,
  validate({ params: transactionIdParamsSchema, body: updateTransactionSchema }),
  transactionController.updateTransaction
);
router.delete(
  "/:transactionId",
  authenticateAndSync,
  validate({ params: transactionIdParamsSchema }),
  transactionController.deleteTransaction
);

export default router;
