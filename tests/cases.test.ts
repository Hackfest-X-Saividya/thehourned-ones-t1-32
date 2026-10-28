import { describe, it, expect, beforeEach } from 'vitest';
import app from '../src/index';
import { CaseService } from '../src/services/case.service';
import { AuditService } from '../src/services/audit.service';
import { ImageService } from '../src/services/image.service';

describe('Task 1: Case Management Endpoints', () => {
  beforeEach(() => {
    CaseService.clearMemory();
    AuditService.clearMemory();
    ImageService.clearMemory();
  });

  it('POST /api/cases creates a new case with valid investigator and logs audit', async () => {
    const res = await app.request('/api/cases', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'x-user-id': 'usr_investigator_1',
        'x-user-role': 'investigator'
      },
      body: JSON.stringify({
        title: 'Bank Robbery Suspect - East District',
        description: 'Male, late 20s, dark stubble, hooded sweatshirt, prominent scar above left eyebrow.',
        incidentDate: '2026-10-27T14:00:00Z'
      })
    }, { ENVIRONMENT: 'test', MOCK_AI: 'true' } as any);

    expect(res.status).toBe(201);
    const body = await res.json() as any;
    expect(body.status).toBe('success');
    expect(body.data.id).toMatch(/^case_/);
    expect(body.data.title).toBe('Bank Robbery Suspect - East District');
    expect(body.data.assignedInvestigatorId).toBe('usr_investigator_1');
    expect(body.data.status).toBe('open');
  });

  it('GET /api/cases lists accessible cases for current investigator', async () => {
    const res = await app.request('/api/cases', {
      method: 'GET',
      headers: {
        'x-user-id': 'usr_investigator_1',
        'x-user-role': 'investigator'
      }
    }, { ENVIRONMENT: 'test', MOCK_AI: 'true' } as any);

    expect(res.status).toBe(200);
    const body = await res.json() as any;
    expect(body.status).toBe('success');
    expect(Array.isArray(body.data)).toBe(true);
    expect(body.data.length).toBeGreaterThanOrEqual(1);
    expect(body.data[0].id).toBe('case_sample_001');
  });

  it('GET /api/cases/:caseId fetches details of authorized case', async () => {
    const res = await app.request('/api/cases/case_sample_001', {
      method: 'GET',
      headers: {
        'x-user-id': 'usr_investigator_1',
        'x-user-role': 'investigator'
      }
    }, { ENVIRONMENT: 'test', MOCK_AI: 'true' } as any);

    expect(res.status).toBe(200);
    const body = await res.json() as any;
    expect(body.status).toBe('success');
    expect(body.data.id).toBe('case_sample_001');
    expect(body.data.title).toBe('Downtown Jewelry Robbery Suspect');
  });

  it('GET /api/cases/:caseId denies unauthorized user and logs unauthorized access attempt', async () => {
    const res = await app.request('/api/cases/case_sample_001', {
      method: 'GET',
      headers: {
        'x-user-id': 'usr_stranger_99',
        'x-user-role': 'investigator'
      }
    }, { ENVIRONMENT: 'test', MOCK_AI: 'true' } as any);

    expect(res.status).toBe(403);
    const body = await res.json() as any;
    expect(body.error.code).toBe('FORBIDDEN');

    // Verify unauthorized audit log was recorded
    const auditRes = await app.request('/api/cases/case_sample_001/audit', {
      method: 'GET',
      headers: {
        'x-user-id': 'usr_investigator_1',
        'x-user-role': 'lead_investigator'
      }
    }, { ENVIRONMENT: 'test', MOCK_AI: 'true' } as any);

    const auditBody = await auditRes.json() as any;
    const unauthorizedEvent = auditBody.data.find((e: any) => e.action === 'UNAUTHORIZED_ACCESS');
    expect(unauthorizedEvent).toBeDefined();
    expect(unauthorizedEvent.userId).toBe('usr_stranger_99');
    expect(unauthorizedEvent.status).toBe('FAILURE');
  });

  it('POST /api/cases validates required input fields', async () => {
    const res = await app.request('/api/cases', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'x-user-id': 'usr_investigator_1'
      },
      body: JSON.stringify({
        title: 'A' // Too short (min 3)
      })
    }, { ENVIRONMENT: 'test', MOCK_AI: 'true' } as any);

    expect(res.status).toBe(400);
    const body = await res.json() as any;
    expect(body.error.code).toBe('VALIDATION_ERROR');
  });
});

