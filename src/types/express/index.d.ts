import "express";

declare global {
  namespace Express {
    interface Request {
      requestId?: string;
      responseTime?: string;
    }
  }
}

export {};
