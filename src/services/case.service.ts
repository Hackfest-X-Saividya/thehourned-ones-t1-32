import { AuthenticatedUser, Case, CaseAccess, Env } from '../types';
import { generateId, getCurrentIsoTimestamp } from '../utils/crypto';
import { AppError } from '../middleware/error-handler';

// In-memory fallback cases store for tests and offline development
const inMemoryCases = new Map<string, Case>();
const inMemoryAccess = new Map<string, CaseAccess[]>();

// Initialize default sample case
const defaultSampleCase: Case = {
  id: 'case_sample_001',
  caseNumber: 'CR-2026-0042',
  title: 'Downtown Jewelry Robbery Suspect',
  description: 'Witness describes adult male, 30s, sharp jawline, hooded jacket, prominent brow.',
  status: 'active_investigation',
  incidentDate: '2026-10-24T21:30:00Z',
  assignedInvestigatorId: 'usr_investigator_1',
  createdAt: '2026-10-25T09:00:00Z',
  updatedAt: '2026-10-25T09:00:00Z'
};
inMemoryCases.set(defaultSampleCase.id, defaultSampleCase);
inMemoryAccess.set(defaultSampleCase.id, [
  {
    id: 'acc_001',
    caseId: defaultSampleCase.id,
    userId: 'usr_investigator_1',
    permission: 'admin',
    grantedAt: '2026-10-25T09:00:00Z'
  },
  {
    id: 'acc_002',
    caseId: defaultSampleCase.id,
    userId: 'usr_analyst_1',
    permission: 'read',
    grantedAt: '2026-10-25T09:15:00Z'
  }
]);

export interface CreateCaseParams {
  caseNumber?: string;
  title: string;
  description?: string;
  status?: Case['status'];
  incidentDate?: string;
  assignedInvestigatorId?: string;
}

export class CaseService {
  constructor(private env: Env) {}

  /**
   * Check if user is authorized to access a specific case
   */
  async isUserAuthorized(caseId: string, user: AuthenticatedUser): Promise<boolean> {
    if (user.role === 'admin' || user.role === 'lead_investigator') {
      return true;
    }

    const caseItem = await this.getCaseById(caseId, user, false);
    if (!caseItem) return false;

    if (caseItem.assignedInvestigatorId === user.id) {
      return true;
    }

    // Check case_access table
    if (this.env.DB) {
      try {
        const row = await this.env.DB.prepare(
          'SELECT id FROM case_access WHERE case_id = ? AND user_id = ?'
        )
          .bind(caseId, user.id)
          .first();
        if (row) return true;
      } catch (err) {
        console.warn('[CaseService] DB check failed for case access, checking memory:', err);
      }
    }

    const accessList = inMemoryAccess.get(caseId) || [];
    return accessList.some(a => a.userId === user.id);
  }

  /**
   * Create a new case
   */
  async createCase(params: CreateCaseParams, creator: AuthenticatedUser): Promise<Case> {
    const id = generateId('case');
    const caseNumber = params.caseNumber || `CR-${new Date().getFullYear()}-${Math.floor(1000 + Math.random() * 9000)}`;
    const now = getCurrentIsoTimestamp();
    const assignedInvestigatorId = params.assignedInvestigatorId || creator.id;

    const newCase: Case = {
      id,
      caseNumber,
      title: params.title,
      description: params.description,
      status: params.status || 'open',
      incidentDate: params.incidentDate,
      assignedInvestigatorId,
      createdAt: now,
      updatedAt: now
    };

    inMemoryCases.set(id, newCase);

    // Grant creator admin permission
    const creatorAccess: CaseAccess = {
      id: generateId('acc'),
      caseId: id,
      userId: creator.id,
      permission: 'admin',
      grantedAt: now
    };
    inMemoryAccess.set(id, [creatorAccess]);

    if (this.env.DB) {
      try {
        await this.env.DB.prepare(
          `INSERT INTO cases (
            id, case_number, title, description, status, incident_date,
            assigned_investigator_id, created_at, updated_at
          ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)`
        )
          .bind(
            newCase.id,
            newCase.caseNumber,
            newCase.title,
            newCase.description || null,
            newCase.status,
            newCase.incidentDate || null,
            newCase.assignedInvestigatorId,
            newCase.createdAt,
            newCase.updatedAt
          )
          .run();

        await this.env.DB.prepare(
          'INSERT INTO case_access (id, case_id, user_id, permission, granted_at) VALUES (?, ?, ?, ?, ?)'
        )
          .bind(creatorAccess.id, id, creator.id, 'admin', now)
          .run();
      } catch (err) {
        console.warn('[CaseService] Failed to insert case into D1, preserved in memory:', err);
      }
    }

    return newCase;
  }

  /**
   * List cases accessible to current user
   */
  async listCases(
    user: AuthenticatedUser,
    options?: { status?: string; search?: string; limit?: number; offset?: number }
  ): Promise<{ cases: Case[]; total: number }> {
    const limit = options?.limit ?? 20;
    const offset = options?.offset ?? 0;

    if (this.env.DB) {
      try {
        let sql = `
          SELECT DISTINCT c.*
          FROM cases c
          LEFT JOIN case_access ca ON c.id = ca.case_id
          WHERE 1=1
        `;
        const params: unknown[] = [];

        // Role-based visibility
        if (user.role !== 'admin' && user.role !== 'lead_investigator') {
          sql += ' AND (c.assigned_investigator_id = ? OR ca.user_id = ?)';
          params.push(user.id, user.id);
        }

        if (options?.status) {
          sql += ' AND c.status = ?';
          params.push(options.status);
        }

        if (options?.search) {
          sql += ' AND (c.title LIKE ? OR c.case_number LIKE ? OR c.description LIKE ?)';
          const searchPattern = `%${options.search}%`;
          params.push(searchPattern, searchPattern, searchPattern);
        }

        // Count total
        const countSql = `SELECT COUNT(*) as count FROM (${sql})`;
        const countRes = await this.env.DB.prepare(countSql).bind(...params).first<{ count: number }>();
        const total = countRes?.count ?? 0;

        sql += ' ORDER BY c.created_at DESC LIMIT ? OFFSET ?';
        params.push(limit, offset);

        const rows = await this.env.DB.prepare(sql).bind(...params).all<any>();
        const cases: Case[] = (rows.results || []).map(r => ({
          id: r.id,
          caseNumber: r.case_number,
          title: r.title,
          description: r.description,
          status: r.status,
          incidentDate: r.incident_date,
          assignedInvestigatorId: r.assigned_investigator_id,
          activeImageId: r.active_image_id,
          createdAt: r.created_at,
          updatedAt: r.updated_at
        }));

        return { cases, total };
      } catch (err) {
        console.warn('[CaseService] D1 listCases failed, falling back to in-memory:', err);
      }
    }

    // In-memory fallback
    let all = Array.from(inMemoryCases.values());
    if (user.role !== 'admin' && user.role !== 'lead_investigator') {
      all = all.filter(c => {
        if (c.assignedInvestigatorId === user.id) return true;
        const access = inMemoryAccess.get(c.id) || [];
        return access.some(a => a.userId === user.id);
      });
    }

    if (options?.status) {
      all = all.filter(c => c.status === options.status);
    }
    if (options?.search) {
      const q = options.search.toLowerCase();
      all = all.filter(
        c =>
          c.title.toLowerCase().includes(q) ||
          c.caseNumber.toLowerCase().includes(q) ||
          (c.description && c.description.toLowerCase().includes(q))
      );
    }

    all.sort((a, b) => (b.createdAt > a.createdAt ? 1 : -1));
    return {
      cases: all.slice(offset, offset + limit),
      total: all.length
    };
  }

  /**
   * Get case details by ID
   */
  async getCaseById(caseId: string, user?: AuthenticatedUser, checkAuth = true): Promise<Case | null> {
    let caseItem: Case | null = null;

    if (this.env.DB) {
      try {
        const row = await this.env.DB.prepare('SELECT * FROM cases WHERE id = ?')
          .bind(caseId)
          .first<any>();
        if (row) {
          caseItem = {
            id: row.id,
            caseNumber: row.case_number,
            title: row.title,
            description: row.description,
            status: row.status,
            incidentDate: row.incident_date,
            assignedInvestigatorId: row.assigned_investigator_id,
            activeImageId: row.active_image_id,
            createdAt: row.created_at,
            updatedAt: row.updated_at
          };
        }
      } catch (err) {
        console.warn('[CaseService] D1 getCaseById failed, fallback to memory:', err);
      }
    }

    if (!caseItem) {
      caseItem = inMemoryCases.get(caseId) || null;
    }

    if (!caseItem) return null;

    if (checkAuth && user) {
      const authorized = await this.isUserAuthorized(caseId, user);
      if (!authorized) {
        throw new AppError('Forbidden: You are not authorized to access this case.', 403, 'FORBIDDEN');
      }
    }

    return caseItem;
  }

  /**
   * Update active image for case
   */
  async setActiveImage(caseId: string, imageId: string): Promise<void> {
    const c = inMemoryCases.get(caseId);
    if (c) {
      c.activeImageId = imageId;
      c.updatedAt = getCurrentIsoTimestamp();
    }

    if (this.env.DB) {
      try {
        await this.env.DB.prepare('UPDATE cases SET active_image_id = ?, updated_at = ? WHERE id = ?')
          .bind(imageId, getCurrentIsoTimestamp(), caseId)
          .run();
      } catch (err) {
        console.warn('[CaseService] Failed to update active_image_id in D1:', err);
      }
    }
  }

  /**
   * Clear in-memory state (for unit tests)
   */
  static clearMemory() {
    inMemoryCases.clear();
    inMemoryAccess.clear();
    inMemoryCases.set(defaultSampleCase.id, { ...defaultSampleCase });
  }
}

