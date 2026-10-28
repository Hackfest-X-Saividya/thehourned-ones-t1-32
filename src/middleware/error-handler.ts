import { Context } from 'hono';
import { ZodError } from 'zod';
import { Env, HonoVariables } from '../types';

export class AppError extends Error {
  public statusCode: number;
  public code: string;
  public details?: unknown;

  constructor(message: string, statusCode = 400, code = 'BAD_REQUEST', details?: unknown) {
    super(message);
    this.name = 'AppError';
    this.statusCode = statusCode;
    this.code = code;
    this.details = details;
  }
}

export function handleGlobalError(err: Error, c: Context<{ Bindings: Env; Variables: HonoVariables }>) {
  const requestId = c.get('requestId') || 'req_unknown';
  console.error(`[Error] Request ${requestId}:`, err);

  if (err instanceof AppError) {
    return c.json(
      {
        error: {
          code: err.code,
          message: err.message,
          requestId,
          details: err.details
        }
      },
      err.statusCode as any
    );
  }

  if (err instanceof ZodError) {
    return c.json(
      {
        error: {
          code: 'VALIDATION_ERROR',
          message: 'Invalid request payload or query parameters',
          requestId,
          details: err.errors.map(e => ({
            field: e.path.join('.'),
            message: e.message
          }))
        }
      },
      400
    );
  }

  return c.json(
    {
      error: {
        code: 'INTERNAL_SERVER_ERROR',
        message: 'An unexpected internal error occurred. Please contact the forensic system administrator.',
        requestId
      }
    },
    500
  );
}
