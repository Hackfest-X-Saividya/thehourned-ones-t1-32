import { describe, it, expect, beforeEach } from 'vitest';
import app from '../src/index';
import { CaseService } from '../src/services/case.service';
import { AuditService } from '../src/services/audit.service';
import { ImageService } from '../src/services/image.service';

describe('Task 1 & Task 2: Image Generation Endpoints', () => {
  beforeEach(() => {
    CaseService.clearMemory();
    AuditService.clearMemory();
    ImageService.clearMemory();
  });

  it('POST /api/generations generates multiple candidate sketches and stores in R2', async () => {
    const res = await app.request('/api/generations', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'x-user-id': 'usr_investigator_1',
        'x-user-role': 'investigator'
      },
      body: JSON.stringify({
        caseId: 'case_sample_001',
        prompt: 'Forensic sketch of male suspect in mid-30s, high cheekbones, thin lips, recessed eyes',
        numCandidates: 3,
        modelName: 'mock-forensic-pencil-v1',
        parameters: {
          guidanceScale: 7.5,
          numInferenceSteps: 30
        }
      })
    }, { ENVIRONMENT: 'test', MOCK_AI: 'true' } as any);

    expect(res.status).toBe(201);
    const body = await res.json() as any;
    expect(body.status).toBe('success');
    expect(body.data.generationId).toMatch(/^gen_/);
    expect(body.data.totalCandidates).toBe(3);
    expect(body.data.candidates.length).toBe(3);

    // Verify metadata for candidate
    const first = body.data.candidates[0];
    expect(first.id).toMatch(/^img_/);
    expect(first.caseId).toBe('case_sample_001');
    expect(first.version).toBe(1);
    expect(first.status).toBe('candidate');
    expect(first.imageUrl).toBe(`/api/images/${first.id}/file`);
    expect(first.r2Key).toContain(`cases/case_sample_001/images/${first.id}.png`);
    expect(first.fileSizeBytes).toBeGreaterThan(0);
  });

  it('GET /api/images/:imageId retrieves image metadata and parent version', async () => {
    // 1. Generate an image first
    const genRes = await app.request('/api/generations', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'x-user-id': 'usr_investigator_1'
      },
      body: JSON.stringify({
        caseId: 'case_sample_001',
        prompt: 'Caucasian male, brown wavy hair, narrow nose, square chin',
        numCandidates: 1
      })
    }, { ENVIRONMENT: 'test', MOCK_AI: 'true' } as any);

    const genBody = await genRes.json() as any;
    const imageId = genBody.data.candidates[0].id;

    // 2. Fetch image metadata
    const getRes = await app.request(`/api/images/${imageId}`, {
      method: 'GET',
      headers: {
        'x-user-id': 'usr_investigator_1'
      }
    }, { ENVIRONMENT: 'test', MOCK_AI: 'true' } as any);

    expect(getRes.status).toBe(200);
    const getBody = await getRes.json() as any;
    expect(getBody.status).toBe('success');
    expect(getBody.data.id).toBe(imageId);
    expect(getBody.data.version).toBe(1);
    expect(getBody.data.parent).toBeNull();
  });

  it('GET /api/images/:imageId/file returns image binary with security headers from private R2', async () => {
    // Generate an image
    const genRes = await app.request('/api/generations', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'x-user-id': 'usr_investigator_1'
      },
      body: JSON.stringify({
        caseId: 'case_sample_001',
        prompt: 'Pencil composite of suspect with beard',
        numCandidates: 1
      })
    }, { ENVIRONMENT: 'test', MOCK_AI: 'true' } as any);

    const genBody = await genRes.json() as any;
    const imageId = genBody.data.candidates[0].id;

    // Stream image
    const fileRes = await app.request(`/api/images/${imageId}/file`, {
      method: 'GET',
      headers: {
        'x-user-id': 'usr_investigator_1'
      }
    }, { ENVIRONMENT: 'test', MOCK_AI: 'true' } as any);

    expect(fileRes.status).toBe(200);
    expect(fileRes.headers.get('Content-Type')).toBe('image/png');
    expect(fileRes.headers.get('Cache-Control')).toContain('private');
    expect(fileRes.headers.get('ETag')).toBeDefined();

    const buffer = await fileRes.arrayBuffer();
    expect(buffer.byteLength).toBeGreaterThan(100);
  });
});

