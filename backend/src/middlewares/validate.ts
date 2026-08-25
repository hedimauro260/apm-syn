import type { Request, Response, NextFunction } from "express";
import { z } from "zod";

export type ValidationSchemas = {
  body?: z.ZodTypeAny;
  params?: z.ZodTypeAny;
  query?: z.ZodTypeAny;
};

export function validate(schemas: ValidationSchemas) {
  return (req: Request, _res: Response, next: NextFunction): void => {
    try {
      if (schemas.body) {
        req.body = schemas.body.parse(req.body);
      }
      if (schemas.params) {
        const parsed = schemas.params.parse(req.params);
        // Express req.params is mutable but not easily reassignable typed; Object.assign preserves reference
        Object.keys(req.params).forEach(k => delete (req.params as Record<string, unknown>)[k]);
        Object.assign(req.params, parsed as Record<string, unknown>);
      }
      if (schemas.query) {
        const parsed = schemas.query.parse(req.query);
        Object.keys(req.query).forEach(k => delete (req.query as Record<string, unknown>)[k]);
        Object.assign(req.query, parsed as Record<string, unknown>);
      }
      next();
    } catch (err) {
      next(err);
    }
  };
}

export function validateBody(schema: z.ZodTypeAny) {
  return validate({ body: schema });
}

export function validateParams(schema: z.ZodTypeAny) {
  return validate({ params: schema });
}

export function validateQuery(schema: z.ZodTypeAny) {
  return validate({ query: schema });
}
