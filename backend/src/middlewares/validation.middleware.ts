import type { NextFunction, Request, RequestHandler, Response } from 'express';
import type { z } from 'zod';

interface ValidatedRequest {
  body?: unknown;
  params?: Request['params'];
}

export const validateRequest = (schema: z.ZodType): RequestHandler => {
  return (req: Request, _res: Response, next: NextFunction): void => {
    try {
      const validated = schema.parse({
        body: req.body,
        params: req.params,
      }) as ValidatedRequest;

      if (validated.body !== undefined) {
        req.body = validated.body;
      }
      if (validated.params !== undefined) {
        req.params = validated.params;
      }

      next();
    } catch (error) {
      next(error);
    }
  };
};
