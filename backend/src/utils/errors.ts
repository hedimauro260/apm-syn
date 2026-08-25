import { AppError } from "./app-error.js";

export { AppError };

export class NotFoundError extends AppError {
  constructor(resource = "Resource") {
    super(404, `${resource.toUpperCase().replace(/\s+/g, "_")}_NOT_FOUND`, `${resource} not found`);
  }
}

export class ForbiddenError extends AppError {
  constructor(message = "Access denied") {
    super(403, "FORBIDDEN", message);
  }
}

export class ConflictError extends AppError {
  constructor(code = "CONFLICT", message = "Conflict") {
    super(409, code, message);
  }
}

export class UnauthorizedError extends AppError {
  constructor(message = "Authentication required") {
    super(401, "UNAUTHORIZED", message);
  }
}

export class BadRequestError extends AppError {
  constructor(message = "Bad request", details?: unknown) {
    super(400, "BAD_REQUEST", message, details);
  }
}

export class TooManyRequestsError extends AppError {
  constructor(message = "Too many requests. Please try again later.") {
    super(429, "RATE_LIMIT_EXCEEDED", message);
  }
}
