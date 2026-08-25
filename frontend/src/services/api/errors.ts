import type { ApiErrorResponse } from "@/services/api/types";

export class ApiError extends Error {
  public readonly status: number;
  public readonly code: string;
  public readonly details?: ApiErrorResponse["error"]["details"];

  constructor(status: number, error: ApiErrorResponse["error"]) {
    super(error.message);

    this.name = "ApiError";
    this.status = status;
    this.code = error.code;
    this.details = error.details;
  }
}
