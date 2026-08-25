import mongoose from "mongoose";
import { WebsiteModel } from "../../src/models/website.model.js";
import type { IWebsite, WebsiteStatus } from "../../src/models/website.model.js";

let counter = 0;

export async function createTestWebsite(
  userId: mongoose.Types.ObjectId,
  overrides: Partial<{ name: string; url: string; description: string; status: WebsiteStatus }> = {}
): Promise<IWebsite> {
  counter++;
  const defaults = {
    userId,
    name: overrides.name || `Website ${counter}`,
    url: overrides.url || `https://example${counter}.com`,
    description: overrides.description || `Test website ${counter}`,
    status: overrides.status || ("active" as WebsiteStatus),
  };

  const website = new WebsiteModel(defaults);
  await website.save();
  return website;
}
