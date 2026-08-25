import http from "node:http";
import { env } from "./config/env.js";
import { logger } from "./config/logger.js";
import { createApp } from "./app.js";
import { connectDatabase, disconnectDatabase } from "./config/database.js";

const app = createApp();
let server: http.Server | null = null;

async function bootstrap(): Promise<void> {
  try {
    await connectDatabase();
  } catch (err) {
    logger.fatal({ err }, "Failed to connect to MongoDB — shutting down");
    process.exit(1);
  }

  server = app.listen(env.PORT, () => {
    logger.info(
      { port: env.PORT, env: env.NODE_ENV, pid: process.pid },
      "Server started"
    );
    logger.info(`Health: http://localhost:${env.PORT}/health`);
    logger.info(`Ready:  http://localhost:${env.PORT}/ready`);
  });
}

void bootstrap();

async function gracefulShutdown(signal: string): Promise<void> {
  logger.info({ signal }, "Shutting down gracefully");

  const shutdownTimeout = setTimeout(() => {
    logger.fatal("Shutdown timed out, forcing exit");
    process.exit(1);
  }, 10_000);

  if (server) {
    await new Promise<void>(resolve => {
      server!.close(() => {
        logger.info("HTTP server closed");
        resolve();
      });
    });
  }

  try {
    await disconnectDatabase();
  } catch (err) {
    logger.error({ err }, "Error during DB disconnect on shutdown");
  }

  clearTimeout(shutdownTimeout);
  process.exit(0);
}

process.on("SIGINT", () => {
  void gracefulShutdown("SIGINT");
});
process.on("SIGTERM", () => {
  void gracefulShutdown("SIGTERM");
});

process.on("unhandledRejection", reason => {
  logger.fatal({ reason }, "Unhandled Rejection");
  void gracefulShutdown("unhandledRejection");
});

process.on("uncaughtException", err => {
  logger.fatal({ err }, "Uncaught Exception");
  process.exit(1);
});
