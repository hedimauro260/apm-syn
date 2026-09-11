interface ClerkErrorItem {
  message?: string;
  longMessage?: string;
}

interface ClerkErrorLike {
  errors?: ClerkErrorItem[];
  message?: string;
}

export function getClerkErrorMessage(
  error: unknown,
  fallback = "Something went wrong. Please try again."
): string {
  if (typeof error === "object" && error !== null) {
    const err = error as ClerkErrorLike;
    const first = err.errors?.[0];
    const message = first?.longMessage || first?.message || err.message;
    if (message) return message;
  }
  return fallback;
}

export function isValidEmail(value: string): boolean {
  return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(value.trim());
}