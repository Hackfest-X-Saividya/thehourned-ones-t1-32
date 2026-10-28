import { Hono } from 'hono';
import { Env, HonoVariables } from '../types';
import { createCaseSchema, listCasesQuerySchema, grantAccessSchema } from '../utils/validation';
import { CaseService } from '../services/case.service';
import { AuditService } from '../services/audit.service';
import { ImageService } from '../services/image.service';
import { AppError } from '../middleware/error-handler';

export const casesRouter = new Hono<{ Bindings: Env; Variables: HonoVariables }>();

/**
 * POST /api/cases — Create a case
 */
casesRouter.post('/', async (c) => {
  const user = c.get('user');
  const requestId = c.get('requestId');
  const body = await c.req.json();
  const parsed = createCaseSchema.parse(body);

  const caseService = new CaseService(c.env);
  const auditService = new AuditService(c.env);

  const newCase = await caseService.createCase(parsed, user);

  // Log audit event
  await auditService.logEvent({
    caseId: newCase.id,
    requestId,
    userId: user.id,
    userEmail: user.email,
    userRole: user.role,
    action: 'CASE_CREATE',
    resourceType: 'case',
    resourceId: newCase.id,
    status: 'SUCCESS',
    details: {
      caseNumber: newCase.caseNumber,
      title: newCase.title
    }
  });

  return c.json(
    {
      status: 'success',
      data: newCase
    },
    201
  );
});

/**
 * GET /api/cases — List cases accessible to the current user
 */
casesRouter.get('/', async (c) => {
  const user = c.get('user');
  const query = c.req.query();
  const parsed = listCasesQuerySchema.parse(query);

  const caseService = new CaseService(c.env);
  const result = await caseService.listCases(user, parsed);

  return c.json({
    status: 'success',
    data: result.cases,
    pagination: {
      total: result.total,
      limit: parsed.limit,
      offset: parsed.offset
    }
  });
});

/**
 * GET /api/cases/:caseId — Fetch case details
 */
casesRouter.get('/:caseId', async (c) => {
  const user = c.get('user');
  const requestId = c.get('requestId');
  const caseId = c.req.param('caseId');

  const caseService = new CaseService(c.env);
  const auditService = new AuditService(c.env);

  try {
    const caseItem = await caseService.getCaseById(caseId, user, true);
    if (!caseItem) {
      throw new AppError(`Case not found: ${caseId}`, 404, 'CASE_NOT_FOUND');
    }

    // Log case access
    await auditService.logEvent({
      caseId,
      requestId,
      userId: user.id,
      userEmail: user.email,
      userRole: user.role,
      action: 'CASE_VIEW',
      resourceType: 'case',
      resourceId: caseId,
      status: 'SUCCESS'
    });

    return c.json({
      status: 'success',
      data: caseItem
    });
  } catch (err: any) {
    if (err.statusCode === 403) {
      // Record failed unauthorized access in audit log
      await auditService.logEvent({
        caseId,
        requestId,
        userId: user.id,
        userEmail: user.email,
        userRole: user.role,
        action: 'UNAUTHORIZED_ACCESS',
        resourceType: 'case',
        resourceId: caseId,
        status: 'FAILURE',
        details: { reason: 'Unauthorized case access attempt' }
      });
    }
    throw err;
  }
});

/**
 * GET /api/cases/:caseId/versions — Retrieve image revisions for a case
 */
casesRouter.get('/:caseId/versions', async (c) => {
  const user = c.get('user');
  const requestId = c.get('requestId');
  const caseId = c.req.param('caseId');

  const caseService = new CaseService(c.env);
  const auditService = new AuditService(c.env);
  const imageService = new ImageService(c.env);

  try {
    const caseItem = await caseService.getCaseById(caseId, user, true);
    if (!caseItem) {
      throw new AppError(`Case not found: ${caseId}`, 404, 'CASE_NOT_FOUND');
    }

    const versions = await imageService.getImageRevisions(caseId, user);

    return c.json({
      status: 'success',
      data: {
        caseId,
        activeImageId: caseItem.activeImageId,
        totalVersions: versions.length,
        versions
      }
    });
  } catch (err: any) {
    if (err.statusCode === 403) {
      await auditService.logEvent({
        caseId,
        requestId,
        userId: user.id,
        userEmail: user.email,
        userRole: user.role,
        action: 'UNAUTHORIZED_ACCESS',
        resourceType: 'case',
        resourceId: caseId,
        status: 'FAILURE',
        details: { endpoint: 'versions' }
      });
    }
    throw err;
  }
});

/**
 * GET /api/cases/:caseId/audit — Retrieve the audit history for an authorized case
 */
casesRouter.get('/:caseId/audit', async (c) => {
  const user = c.get('user');
  const requestId = c.get('requestId');
  const caseId = c.req.param('caseId');

  const caseService = new CaseService(c.env);
  const auditService = new AuditService(c.env);

  try {
    const caseItem = await caseService.getCaseById(caseId, user, true);
    if (!caseItem) {
      throw new AppError(`Case not found: ${caseId}`, 404, 'CASE_NOT_FOUND');
    }

    const query = c.req.query();
    const result = await auditService.getCaseAuditLogs(caseId, {
      action: query.action,
      userId: query.userId,
      status: query.status,
      limit: query.limit ? parseInt(query.limit, 10) : 50,
      offset: query.offset ? parseInt(query.offset, 10) : 0
    });

    // Log the audit view
    await auditService.logEvent({
      caseId,
      requestId,
      userId: user.id,
      userEmail: user.email,
      userRole: user.role,
      action: 'AUDIT_VIEW',
      resourceType: 'audit',
      resourceId: caseId,
      status: 'SUCCESS'
    });

    return c.json({
      status: 'success',
      data: result.logs,
      pagination: {
        total: result.total,
        limit: query.limit ? parseInt(query.limit, 10) : 50,
        offset: query.offset ? parseInt(query.offset, 10) : 0
      }
    });
  } catch (err: any) {
    if (err.statusCode === 403) {
      await auditService.logEvent({
        caseId,
        requestId,
        userId: user.id,
        userEmail: user.email,
        userRole: user.role,
        action: 'UNAUTHORIZED_ACCESS',
        resourceType: 'audit',
        resourceId: caseId,
        status: 'FAILURE',
        details: { endpoint: 'audit' }
      });
    }
    throw err;
  }
});

/**
 * POST /api/cases/:caseId/access — Grant access to a user
 */
casesRouter.post('/:caseId/access', async (c) => {
  const user = c.get('user');
  const caseId = c.req.param('caseId');
  const body = await c.req.json();
  const parsed = grantAccessSchema.parse(body);

  const caseService = new CaseService(c.env);
  const caseItem = await caseService.getCaseById(caseId, user, true);
  if (!caseItem) {
    throw new AppError(`Case not found: ${caseId}`, 404, 'CASE_NOT_FOUND');
  }

  // Only lead investigators, admins, or assigned investigators can grant access
  if (user.role !== 'admin' && user.role !== 'lead_investigator' && caseItem.assignedInvestigatorId !== user.id) {
    throw new AppError('Only administrators or assigned lead investigators can grant case access.', 403, 'FORBIDDEN');
  }

  if (c.env.DB) {
    try {
      await c.env.DB.prepare(
        'INSERT OR REPLACE INTO case_access (id, case_id, user_id, permission, granted_at) VALUES (?, ?, ?, ?, datetime("now"))'
      )
        .bind(`acc_${crypto.randomUUID().slice(0, 8)}`, caseId, parsed.userId, parsed.permission)
        .run();
    } catch (err) {
      console.warn('[casesRouter] Failed to grant access in D1:', err);
    }
  }

  return c.json({
    status: 'success',
    message: `Granted ${parsed.permission} access on case ${caseId} to user ${parsed.userId}`
  });
});

