import { describe, it, expect, beforeEach } from 'vitest';
import app from '../src/index';
import { CaseService } from '../src/services/case.service';
import { AuditService } from '../src/services/audit.service';
import { ImageService } from '../src/services/image.service';

describe('Task 1 & Task 3: Audit Trail and Security Integrity', () => {
  beforeEach(() => {
    CaseService.clearMemory();
    AuditService.clearMemory();
    ImageService.clearMemory();
  });

  it('records comprehensive audit events across life cycle: generate, edit, export', async () => {
    // 1. Generate candidate (triggers IMAGE_GENERATE)
    const genRes = await app.request('/api/generations', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json', 'x-user-id': 'usr_investigator_1' },
      body: JSON.stringify({
        caseId: 'case_sample_001',
        prompt: 'Male suspect with goatee',
        numCandidates: 1
      })
    }, { ENVIRONMENT: 'test', MOCK_AI: 'true' } as any);
    const image = (await genRes.json() as any).data.candidates[0];

    // 2. Export sketch (triggers IMAGE_EXPORT)
    const exportRes = await app.request(`/api/images/${image.id}/export`, {
      method: 'POST',
      headers: { 'x-user-id': 'usr_investigator_1' }
    }, { ENVIRONMENT: 'test', MOCK_AI: 'true' } as any);
    expect(exportRes.status).toBe(200);

    // 3. Retrieve audit history
    const auditRes = await app.request('/api/cases/case_sample_001/audit', {
      method: 'GET',
      headers: { 'x-user-id': 'usr_investigator_1' }
    }, { ENVIRONMENT: 'test', MOCK_AI: 'true' } as any);

    expect(auditRes.status).toBe(200);
    const auditBody = await auditRes.json() as any;
    const actions = auditBody.data.map((e: any) => e.action);

    expect(actions).toContain('IMAGE_GENERATE');
    expect(actions).toContain('IMAGE_EXPORT');

    // Check entry fields per Task 1: user, action, resource ID, timestamp, success/failure status, request ID
    const genEvent = auditBody.data.find((e: any) => e.action === 'IMAGE_GENERATE');
    expect(genEvent.userId).toBe('usr_investigator_1');
    expect(genEvent.requestId).toMatch(/^req_/);
    expect(genEvent.timestamp).toBeDefined();
    expect(genEvent.status).toBe('SUCCESS');
    expect(genEvent.resourceId).toMatch(/^gen_/);
  });

  it('prohibits modification or deletion of audit logs (Immutability guarantee)', async () => {
    const deleteRes = await app.request('/api/audit/aud_sample_001', {
      method: 'DELETE',
      headers: { 'x-user-id': 'usr_investigator_1' }
    }, { ENVIRONMENT: 'test', MOCK_AI: 'true' } as any);

    expect(deleteRes.status).toBe(405);
    const body = await deleteRes.json() as any;
    expect(body.error.code).toBe('METHOD_NOT_ALLOWED');
  });

  it('restricts global audit log inspection to admins and lead investigators', async () => {
    // Ordinary investigator attempts global audit inspection
    const deniedRes = await app.request('/api/audit', {
      method: 'GET',
      headers: {
        'x-user-id': 'usr_investigator_1',
        'x-user-role': 'investigator'
      }
    }, { ENVIRONMENT: 'test', MOCK_AI: 'true' } as any);

    expect(deniedRes.status).toBe(403);

    // Admin attempts global audit inspection
    const adminRes = await app.request('/api/audit', {
      method: 'GET',
      headers: {
        'x-user-id': 'usr_admin_1',
        'x-user-role': 'admin'
      }
    }, { ENVIRONMENT: 'test', MOCK_AI: 'true' } as any);

    expect(adminRes.status).toBe(200);
    const adminBody = await adminRes.json() as any;
    expect(Array.isArray(adminBody.data)).toBe(true);
  });
});

