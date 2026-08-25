import express from "express";
import helmet from "helmet";
import cors from "cors";
import hpp from "hpp";
import pinoHttp from "pino-http";
import { env } from "./config/env.js";
import { logger } from "./config/logger.js";
import routes from "./routes/index.js";
import userRoutes from "./routes/user.routes.js";
import walletRoutes from "./routes/wallet.routes.js";
import walletTransfersRoutes from "./routes/wallet-transfers.routes.js";
import transactionRoutes from "./routes/transaction.routes.js";
import websiteRoutes from "./routes/website.routes.js";
import marketDataRoutes from "./modules/market-data/market-data.routes.js";
import portfolioRoutes from "./modules/portfolio/portfolio.routes.js";
import goalRoutes from "./routes/goal.routes.js";
import accountRoutes from "./modules/account/account.routes.js";
import { requestIdMiddleware } from "./middlewares/request-id.js";
import { globalLimiter } from "./middlewares/rate-limit.js";
import { notFoundMiddleware } from "./middlewares/not-found.middleware.js";
import { errorMiddleware } from "./middlewares/error.middleware.js";

export function createApp(): express.Express {
  const app = express();

  app.set("trust proxy", 1);

  app.use(requestIdMiddleware);
  app.use(helmet({
    contentSecurityPolicy: {
      directives: {
        defaultSrc: ["'self'"],
      },
    },
    hsts: { maxAge: 31536000, includeSubDomains: true },
  }));
  app.use(
    cors({
      origin: env.CORS_ORIGIN,
      credentials: true,
    })
  );
  app.use(hpp());
  app.use(express.json({ limit: "256kb" }));
  app.use(express.urlencoded({ extended: true, limit: "256kb" }));

  app.use(
    pinoHttp({
      logger,
      autoLogging: true,
      genReqId: req => req.requestId,
    })
  );

  app.use(globalLimiter);

  app.use(routes);
  app.use("/api/v1/users", userRoutes);
  app.use("/api/v1/wallets", walletRoutes);
  app.use("/api/v1/wallet-transfers", walletTransfersRoutes);
  app.use("/api/v1/transactions", transactionRoutes);
  app.use("/api/v1/websites", websiteRoutes);
  app.use("/api/v1/market-data", marketDataRoutes);
  app.use("/api/v1/portfolio", portfolioRoutes);
  app.use("/api/v1/goals", goalRoutes);
  app.use("/api/v1", accountRoutes);

  app.use(notFoundMiddleware);
  app.use(errorMiddleware);

  return app;
}

export const app = createApp();
