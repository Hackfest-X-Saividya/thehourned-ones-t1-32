import { describe, it, expect, beforeEach } from 'vitest';
import app from '../src/index';
import { CaseService } from '../src/services/case.service';
import { AuditService } from '../src/services/audit.service';
import { ImageService } from '../src/services/image.service';

describe('Task 3: Security & Rate Limiting', () => {
  beforeEach(() => {
    CaseService.clearMemory();
    AuditService.clearMemory();
    ImageService.clearMemory();
  });

  it('enforces rate limiting when request threshold is exceeded', async () => {
    // Make rapid requests to /api/cases
    const makeReq = () =>
      app.request('/api/cases', {
        method: 'GET',
        headers: {
          'x-user-id': 'usr_investigator_1',
          'cf-connecting-ip': '192.168.1.100'
        }
      }, { ENVIRONMENT: 'development', MOCK_AI: 'true' } as any);

    let rateLimited = false;
    for (let i = 0; i < 130; i++) {
      const res = await makeReq();
      if (res.status === 429) {
        rateLimited = true;
        const body = await res.json() as any;
        expect(body.error.code).toBe('RATE_LIMIT_EXCEEDED');
        expect(res.headers.get('X-RateLimit-Remaining')).toBe('0');
        break;
      }
    }

    expect(rateLimited).toBe(true);
  });

  it('prevents unauthorized users from streaming private R2 images', async () => {
    // 1. Generate image in case_sample_001
    const genRes = await app.request('/api/generations', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json', 'x-user-id': 'usr_investigator_1' },
      body: JSON.stringify({
        caseId: 'case_sample_001',
        prompt: 'Private sketch security test',
        numCandidates: 1
      })
    }, { ENVIRONMENT: 'test', MOCK_AI: 'true' } as any);
    const imageId = (await genRes.json() as any).data.candidates[0].id;

    // 2. Stranger tries to fetch the image file
    const streamRes = await app.request(`/api/images/${imageId}/file`, {
      method: 'GET',
      headers: {
        'x-user-id': 'usr_unauthorized_attacker',
        'x-user-role': 'investigator'
      }
    }, { ENVIRONMENT: 'test', MOCK_AI: 'true' } as any);

    expect(streamRes.status).toBe(403);
    const body = await streamRes.json() as any;
    expect(body.error.code).toBe('FORBIDDEN');
  });

  it('validates candidate count bounds (max 4)', async () => {
    const res = await app.request('/api/generations', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json', 'x-user-id': 'usr_investigator_1' },
      body: JSON.stringify({
        caseId: 'case_sample_001',
        prompt: 'Test prompt',
        numCandidates: 10 // Invalid: maximum 4
      })
    }, { ENVIRONMENT: 'test', MOCK_AI: 'true' } as any);

    expect(res.status).toBe(400);
    const body = await res.json() as any;
    expect(body.error.code).toBe('VALIDATION_ERROR');
  });
});

