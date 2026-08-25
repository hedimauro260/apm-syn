import { MongoMemoryServer } from "mongodb-memory-server";

let mongod: MongoMemoryServer | null = null;

export async function getMongod(): Promise<MongoMemoryServer> {
  if (!mongod) {
    mongod = await MongoMemoryServer.create();
  }
  return mongod;
}

export async function stopMongod(): Promise<void> {
  if (mongod) {
    await mongod.stop();
    mongod = null;
  }
}
