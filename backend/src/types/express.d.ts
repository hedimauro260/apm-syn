declare namespace Express {
  interface Request {
    requestId: string;
    user?: {
      id: string;
      clerkId: string;
    };
  }
}
