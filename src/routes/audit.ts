import { Hono } from 'hono';
import { Env, HonoVariables } from '../types';
import { AuditService } from '../services/audit.service';
import { AppError } from '../middleware/error-handler';

export const auditRouter = new Hono<{ Bindings: Env; Variables: HonoVariables }>();

/**
 * GET /api/audit — System-wide audit log retrieval (Admins and Lead Investigators only)
 */
auditRouter.get('/', async (c) => {
  const user = c.get('user');

  if (user.role !== 'admin' && user.role !== 'lead_investigator') {
    throw new AppError(
      'Forbidden: Only administrators and lead investigators may view global audit logs.',
      403,
      'FORBIDDEN'
    );
  }

  const query = c.req.query();
  const limit = query.limit ? parseInt(query.limit, 10) : 50;
  const offset = query.offset ? parseInt(query.offset, 10) : 0;

  if (c.env.DB) {
    try {
      let sql = 'SELECT * FROM audit_logs WHERE 1=1';
      const params: unknown[] = [];

      if (query.action) {
        sql += ' AND action = ?';
        params.push(query.action);
      }
      if (query.userId) {
        sql += ' AND user_id = ?';
        params.push(query.userId);
      }
      if (query.caseId) {
        sql += ' AND case_id = ?';
        params.push(query.caseId);
      }

      const countSql = sql.replace('SELECT *', 'SELECT COUNT(*) as count');
      const countRes = await c.env.DB.prepare(countSql).bind(...params).first<{ count: number }>();
      const total = countRes?.count ?? 0;

      sql += ' ORDER BY timestamp DESC LIMIT ? OFFSET ?';
      params.push(limit, offset);

      const rows = await c.env.DB.prepare(sql).bind(...params).all<any>();
      const logs = (rows.results || []).map(row => ({
        id: row.id,
        caseId: row.case_id,
        requestId: row.request_id,
        userId: row.user_id,
        userEmail: row.user_email,
        userRole: row.user_role,
        action: row.action,
        resourceType: row.resource_type,
        resourceId: row.resource_id,
        status: row.status,
        ipAddress: row.ip_address,
        userAgent: row.user_agent,
        details: typeof row.details_json === 'string' ? JSON.parse(row.details_json) : row.details_json || {},
        timestamp: row.timestamp
      }));

      return c.json({
        status: 'success',
        data: logs,
        pagination: { total, limit, offset }
      });
    } catch (err) {
      console.warn('[auditRouter] DB query failed:', err);
    }
  }

  // Fallback to in-memory audit logs
  const auditService = new AuditService(c.env);
  const result = await auditService.getCaseAuditLogs(query.caseId || '', {
    action: query.action,
    userId: query.userId,
    limit,
    offset
  });

  return c.json({
    status: 'success',
    data: result.logs,
    pagination: { total: result.total, limit, offset }
  });
});

/**
 * Explicitly reject any modification or deletion of audit logs (Immutability guarantee)
 */
auditRouter.all('/:id', async () => {
  throw new AppError(
    'Audit logs are strictly immutable and cannot be updated or deleted.',
    405,
    'METHOD_NOT_ALLOWED'
  );
});

