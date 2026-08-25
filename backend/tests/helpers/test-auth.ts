import jwt from "jsonwebtoken";

const TEST_JWT_SECRET = "test_jwt_secret_key_for_development_only";

export function generateMockToken(clerkId: string): string {
  return jwt.sign({ sub: clerkId }, TEST_JWT_SECRET, { expiresIn: "1h" });
}

export function generateExpiredToken(clerkId: string): string {
  return jwt.sign({ sub: clerkId }, TEST_JWT_SECRET, { expiresIn: "-1h" });
}

export function getMockClerkId(): string {
  return `clerk_test_${Date.now()}_${Math.random().toString(36).slice(2, 9)}`;
}
