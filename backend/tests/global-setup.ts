import { config } from "dotenv";
import path from "path";
import mongoose from "mongoose";

config({ path: path.resolve(process.cwd(), ".env") });

export async function setup(): Promise<void> {
  const devUri = process.env.MONGODB_URI;
  if (!devUri) {
    throw new Error("MONGODB_URI not set in .env");
  }

  let testUri: string;
  if (devUri.includes("?")) {
    const [base, queryString] = devUri.split("?");
    const params = new URLSearchParams(queryString);
    params.set("appName", "APM-SYN-Test");
    testUri = `${base.replace(/\/$/, "")}/apm-syn-test?${params.toString()}`;
  } else {
    testUri = `${devUri.replace(/\/$/, "")}/apm-syn-test`;
  }

  process.env.MONGODB_URI = testUri;
}

export async function teardown(): Promise<void> {
  await mongoose.disconnect();
}
