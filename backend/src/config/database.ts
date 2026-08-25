import mongoose from "mongoose";
import { env } from "./env.js";
import { logger } from "./logger.js";

function sanitizeUri(uri: string): string {
  try {
    const url = new URL(uri);
    if (url.password) url.password = "***";
    if (url.username) url.username = "***";
    return url.toString();
  } catch {
    return uri.replace(/\/\/.*@/, "//***:***@");
  }
}

function sleep(ms: number): Promise<void> {
  return new Promise(resolve => setTimeout(resolve, ms));
}

export function getConnectionStatus(): "connected" | "disconnected" | "connecting" {
  const state = mongoose.connection.readyState;
  if (state === 1) return "connected";
  if (state === 2) return "connecting";
  return "disconnected";
}

export function isConnected(): boolean {
  return mongoose.connection.readyState === 1;
}

export async function connectDatabase(): Promise<typeof mongoose> {
  mongoose.set("strictQuery", true);

  // Estratégia de índices por ambiente: autoIndex true em dev/test, false em prod
  mongoose.set("autoIndex", env.NODE_ENV !== "production");

  const uri = env.MONGODB_URI;
  const maxRetries = env.MONGODB_MAX_RETRIES;
  const baseDelay = env.MONGODB_RETRY_DELAY_MS;

  // Bypass em test se URI vazia (permite typecheck sem DB)
  if (env.NODE_ENV === "test" && !uri) {
    logger.warn("MONGODB_URI empty in test env — skipping connection");
    return mongoose;
  }

  if (!uri) {
    throw new Error("MONGODB_URI is required");
  }

  let lastError: unknown;

  for (let attempt = 0; attempt <= maxRetries; attempt++) {
    try {
      if (attempt > 0) {
        const delay = baseDelay * Math.pow(2, attempt - 1);
        logger.info({ attempt, maxRetries, delay }, `Retrying MongoDB connection in ${delay}ms`);
        await sleep(delay);
      }

      logger.info(
        { uri: sanitizeUri(uri), attempt: attempt + 1, maxRetries: maxRetries + 1 },
        "Connecting to MongoDB"
      );

      await mongoose.connect(uri, {
        serverSelectionTimeoutMS: 5000,
        autoIndex: env.NODE_ENV !== "production",
      });

      logger.info("MongoDB connected successfully");

      // Listeners para observabilidade (registrados uma vez)
      mongoose.connection.on("error", err => {
        logger.error({ err }, "MongoDB connection error");
      });

      mongoose.connection.on("disconnected", () => {
        logger.warn("MongoDB disconnected");
      });

      mongoose.connection.on("reconnected", () => {
        logger.info("MongoDB reconnected");
      });

      return mongoose;
    } catch (err) {
      lastError = err;
      const message = err instanceof Error ? err.message : String(err);
      logger.error(
        { err, attempt: attempt + 1, maxRetries: maxRetries + 1 },
        `MongoDB connection attempt ${attempt + 1} failed: ${message}`
      );

      if (attempt === maxRetries) break;
    }
  }

  const sanitized = sanitizeUri(uri);
  const errorMessage = `Failed to connect to MongoDB after ${maxRetries + 1} attempts (uri: ${sanitized})`;
  logger.fatal({ err: lastError }, errorMessage);
  throw new Error(errorMessage);
}

export async function disconnectDatabase(): Promise<void> {
  if (mongoose.connection.readyState === 0) {
    logger.info("MongoDB already disconnected");
    return;
  }

  try {
    await mongoose.disconnect();
    logger.info("MongoDB disconnected gracefully");
  } catch (err) {
    logger.error({ err }, "Error disconnecting from MongoDB");
    throw err;
  }
}
