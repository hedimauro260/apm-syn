import dotenv from "dotenv";
import { z } from "zod";

dotenv.config();

const baseEnvSchema = z.object({
  NODE_ENV: z.enum(["development", "production", "test"]).default("development"),
  PORT: z.coerce.number().int().min(1).max(65535).default(3000),
  LOG_LEVEL: z.enum(["fatal", "error", "warn", "info", "debug", "trace", "silent"]).default("info"),
  CORS_ORIGIN: z.string().default("http://localhost:5173"),
  MONGODB_URI: z.string().default(""),
  CLERK_SECRET_KEY: z.string().default(""),
  CLERK_PUBLISHABLE_KEY: z.string().optional().default(""),
  COINGECKO_API_KEY: z.string().optional().default(""),
  MONGODB_MAX_RETRIES: z.coerce.number().int().min(0).max(10).default(3),
  MONGODB_RETRY_DELAY_MS: z.coerce.number().int().min(100).max(30000).default(1000),
});

const envSchema = baseEnvSchema.superRefine((val, ctx) => {
  if (val.NODE_ENV !== "test" && !val.MONGODB_URI) {
    ctx.addIssue({ code: "custom", path: ["MONGODB_URI"], message: "MONGODB_URI is required" });
  }
  if (val.NODE_ENV !== "test" && !val.CLERK_SECRET_KEY) {
    ctx.addIssue({
      code: "custom",
      path: ["CLERK_SECRET_KEY"],
      message: "CLERK_SECRET_KEY is required",
    });
  }
});

export type Env = z.infer<typeof envSchema>;

let env: Env;

try {
  env = envSchema.parse(process.env);
} catch (err) {
  if (err instanceof z.ZodError) {
    console.error("❌ Invalid environment variables:", z.treeifyError(err));
    process.exit(1);
  }
  throw err;
}

export { env };
