import { AuditAction, AuditLogEntry, AuditResourceType, AuditStatus, Env } from '../types';
import { generateId, getCurrentIsoTimestamp } from '../utils/crypto';

// In-memory fallback log store for test suites or offline dev
const inMemoryAuditLogs: AuditLogEntry[] = [];

export interface CreateAuditLogParams {
  caseId?: string;
  requestId: string;
  userId: string;
  userEmail?: string;
  userRole?: string;
  action: AuditAction;
  resourceType: AuditResourceType;
  resourceId?: string;
  status: AuditStatus;
  ipAddress?: string;
  userAgent?: string;
  details?: Record<string, unknown>;
}

export class AuditService {
  constructor(private env: Env) {}

  /**
   * Strictly appends an immutable audit event to D1 database
   */
  async logEvent(params: CreateAuditLogParams): Promise<AuditLogEntry> {
    const entry: AuditLogEntry = {
      id: generateId('aud'),
      caseId: params.caseId,
      requestId: params.requestId,
      userId: params.userId,
      userEmail: params.userEmail,
      userRole: params.userRole,
      action: params.action,
      resourceType: params.resourceType,
      resourceId: params.resourceId,
      status: params.status,
      ipAddress: params.ipAddress,
      userAgent: params.userAgent,
      details: params.details || {},
      timestamp: getCurrentIsoTimestamp()
    };

    // Store in-memory buffer for fast retrieval and test runners
    inMemoryAuditLogs.unshift(entry);

    if (this.env.DB) {
      try {
        await this.env.DB.prepare(
          `INSERT INTO audit_logs (
            id, case_id, request_id, user_id, user_email, user_role,
            action, resource_type, resource_id, status, ip_address,
            user_agent, details_json, timestamp
          ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`
        )
          .bind(
            entry.id,
            entry.caseId || null,
            entry.requestId,
            entry.userId,
            entry.userEmail || null,
            entry.userRole || null,
            entry.action,
            entry.resourceType,
            entry.resourceId || null,
            entry.status,
            entry.ipAddress || null,
            entry.userAgent || null,
            JSON.stringify(entry.details),
            entry.timestamp
          )
          .run();
      } catch (err) {
        console.warn('[AuditService] Failed to persist audit log to D1:', err);
      }
    }

    return entry;
  }

  /**
   * Retrieves audit logs for a specific case with optional filtering
   */
  async getCaseAuditLogs(
    caseId: string,
    filters?: {
      action?: string;
      userId?: string;
      status?: string;
      limit?: number;
      offset?: number;
    }
  ): Promise<{ logs: AuditLogEntry[]; total: number }> {
    const limit = filters?.limit ?? 50;
    const offset = filters?.offset ?? 0;

    if (this.env.DB) {
      try {
        let query = 'SELECT * FROM audit_logs WHERE case_id = ?';
        const params: unknown[] = [caseId];

        if (filters?.action) {
          query += ' AND action = ?';
          params.push(filters.action);
        }
        if (filters?.userId) {
          query += ' AND user_id = ?';
          params.push(filters.userId);
        }
        if (filters?.status) {
          query += ' AND status = ?';
          params.push(filters.status);
        }

        // Count total
        const countQuery = query.replace('SELECT *', 'SELECT COUNT(*) as count');
        const countResult = await this.env.DB.prepare(countQuery).bind(...params).first<{ count: number }>();
        const total = countResult?.count ?? 0;

        query += ' ORDER BY timestamp DESC LIMIT ? OFFSET ?';
        params.push(limit, offset);

        const rows = await this.env.DB.prepare(query).bind(...params).all<any>();

        const logs: AuditLogEntry[] = (rows.results || []).map(row => ({
          id: row.id,
          caseId: row.case_id,
          requestId: row.request_id,
          userId: row.user_id,
          userEmail: row.user_email,
          userRole: row.user_role,
          action: row.action as AuditAction,
          resourceType: row.resource_type as AuditResourceType,
          resourceId: row.resource_id,
          status: row.status as AuditStatus,
          ipAddress: row.ip_address,
          userAgent: row.user_agent,
          details: typeof row.details_json === 'string' ? JSON.parse(row.details_json) : row.details_json || {},
          timestamp: row.timestamp
        }));

        return { logs, total };
      } catch (err) {
        console.warn('[AuditService] Falling back to in-memory audit logs:', err);
      }
    }

    // Fallback: in-memory filtering
    let filtered = inMemoryAuditLogs.filter(l => l.caseId === caseId);
    if (filters?.action) filtered = filtered.filter(l => l.action === filters.action);
    if (filters?.userId) filtered = filtered.filter(l => l.userId === filters.userId);
    if (filters?.status) filtered = filtered.filter(l => l.status === filters.status);

    return {
      logs: filtered.slice(offset, offset + limit),
      total: filtered.length
    };
  }

  /**
   * Helper to clear in-memory logs (for unit tests)
   */
  static clearMemory() {
    inMemoryAuditLogs.length = 0;
  }
}

