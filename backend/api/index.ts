import type { Request, Response } from "express";

import { app } from "../src/app.js";
import { getMongoConnection } from "../src/config/database.js";

export default async function handler(req: Request, res: Response): Promise<void> {
  await getMongoConnection();
  app(req, res);
}
