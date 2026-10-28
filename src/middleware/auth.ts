import { Context, Next } from 'hono';
import { AuthenticatedUser, Env, HonoVariables } from '../types';
import { AppError } from './error-handler';

// Fallback users for development and testing if D1 does not have the record
const DEFAULT_USERS: Record<string, AuthenticatedUser> = {
  usr_investigator_1: {
    id: 'usr_investigator_1',
    name: 'Detective Sarah Connor',
    email: 'sconnor@forensics.pd.gov',
    role: 'investigator',
    badgeNumber: 'BADGE-4091'
  },
  usr_lead_1: {
    id: 'usr_lead_1',
    name: 'Inspector James Gordon',
    email: 'jgordon@forensics.pd.gov',
    role: 'lead_investigator',
    badgeNumber: 'BADGE-1002'
  },
  usr_analyst_1: {
    id: 'usr_analyst_1',
    name: 'Analyst Chloe Decker',
    email: 'cdecker@forensics.pd.gov',
    role: 'analyst',
    badgeNumber: 'BADGE-7741'
  },
  usr_admin_1: {
    id: 'usr_admin_1',
    name: 'Captain Raymond Holt',
    email: 'rholt@forensics.pd.gov',
    role: 'admin',
    badgeNumber: 'BADGE-0001'
  }
};

export async function authMiddleware(c: Context<{ Bindings: Env; Variables: HonoVariables }>, next: Next) {
  const authHeader = c.req.header('Authorization');
  const queryUserId = c.req.query('userId') || c.req.query('token');
  const xUserId = c.req.header('x-user-id') || queryUserId;
  const xUserRole = (c.req.header('x-user-role') || c.req.query('role')) as AuthenticatedUser['role'] | undefined;
  const xUserEmail = c.req.header('x-user-email');

  let resolvedUser: AuthenticatedUser | null = null;

  // 1. Direct header simulation for frontend / testing
  if (xUserId) {
    if (DEFAULT_USERS[xUserId]) {
      resolvedUser = { ...DEFAULT_USERS[xUserId] };
      if (xUserRole) resolvedUser.role = xUserRole;
      if (xUserEmail) resolvedUser.email = xUserEmail;
    } else {
      // Query D1 if DB binding exists
      if (c.env.DB) {
        try {
          const row = await c.env.DB.prepare('SELECT id, name, email, role, badge_number FROM users WHERE id = ?')
            .bind(xUserId)
            .first<{ id: string; name: string; email: string; role: AuthenticatedUser['role']; badge_number: string }>();
          if (row) {
            resolvedUser = {
              id: row.id,
              name: row.name,
              email: row.email,
              role: row.role,
              badgeNumber: row.badge_number
            };
          }
        } catch (e) {
          // fallback if DB table not yet initialized
        }
      }

      if (!resolvedUser) {
        resolvedUser = {
          id: xUserId,
          name: xUserEmail ? xUserEmail.split('@')[0] : `User ${xUserId}`,
          email: xUserEmail || `${xUserId}@police.gov`,
          role: xUserRole || 'investigator'
        };
      }
    }
  } else if (authHeader && authHeader.startsWith('Bearer ')) {
    const token = authHeader.substring(7).trim();

    // Check simple token patterns (e.g. "token_usr_investigator_1" or "usr_investigator_1" or JSON)
    if (DEFAULT_USERS[token]) {
      resolvedUser = DEFAULT_USERS[token];
    } else if (token.startsWith('usr_')) {
      resolvedUser = DEFAULT_USERS[token] || {
        id: token,
        name: `Investigator ${token}`,
        email: `${token}@police.gov`,
        role: 'investigator'
      };
    } else {
      try {
        // Base64 JSON token support (e.g. {"id":"usr_1","role":"investigator",...})
        const decoded = JSON.parse(atob(token));
        if (decoded && decoded.id) {
          resolvedUser = {
            id: decoded.id,
            name: decoded.name || 'Forensic Officer',
            email: decoded.email || `${decoded.id}@police.gov`,
            role: decoded.role || 'investigator',
            badgeNumber: decoded.badgeNumber
          };
        }
      } catch {
        // Fallback or invalid token
      }
    }
  }

  // In development/test mode, provide default user if none passed
  if (!resolvedUser) {
    const env = c.env.ENVIRONMENT || 'development';
    if (env !== 'production') {
      resolvedUser = DEFAULT_USERS['usr_investigator_1'];
    } else {
      throw new AppError('Authentication required. Missing or invalid Authorization header.', 401, 'UNAUTHORIZED');
    }
  }

  c.set('user', resolvedUser);
  await next();
}

