import { Context, Next } from 'hono';
import { Env, HonoVariables } from '../types';
import { AppError } from './error-handler';

// Rate limiting in-memory store for Workers instance
interface RateLimitRecord {
  count: number;
  resetAt: number;
}

const rateLimitStore = new Map<string, RateLimitRecord>();

function cleanupExpiredRecords(now: number) {
  if (rateLimitStore.size > 1000) {
    for (const [key, record] of rateLimitStore.entries()) {
      if (record.resetAt <= now) {
        rateLimitStore.delete(key);
      }
    }
  }
}

export interface RateLimitOptions {
  windowMs?: number; // default 1 minute (60_000 ms)
  maxRequests?: number; // default 60 requests per minute
}

export function rateLimiter(options: RateLimitOptions = {}) {
  const windowMs = options.windowMs || 60_000;
  const maxRequests = options.maxRequests || 60;

  return async (c: Context<{ Bindings: Env; Variables: HonoVariables }>, next: Next) => {
    // Skip rate limiting in test environment if configured
    if (c.env.ENVIRONMENT === 'test' && !options.maxRequests) {
      return next();
    }

    const clientIp = c.req.header('cf-connecting-ip') || c.req.header('x-forwarded-for') || '127.0.0.1';
    const user = c.get('user');
    const identifier = user ? `usr:${user.id}` : `ip:${clientIp}`;

    const now = Date.now();
    cleanupExpiredRecords(now);
    let record = rateLimitStore.get(identifier);

    if (!record || record.resetAt <= now) {
      record = {
        count: 1,
        resetAt: now + windowMs
      };
      rateLimitStore.set(identifier, record);
    } else {
      record.count += 1;
    }

    const remaining = Math.max(0, maxRequests - record.count);
    const resetSeconds = Math.ceil((record.resetAt - now) / 1000);

    c.header('X-RateLimit-Limit', maxRequests.toString());
    c.header('X-RateLimit-Remaining', remaining.toString());
    c.header('X-RateLimit-Reset', resetSeconds.toString());

    if (record.count > maxRequests) {
      throw new AppError(
        `Rate limit exceeded. Maximum ${maxRequests} requests per minute allowed. Try again in ${resetSeconds} seconds.`,
        429,
        'RATE_LIMIT_EXCEEDED',
        { resetInSeconds: resetSeconds }
      );
    }

    await next();
  };
}

