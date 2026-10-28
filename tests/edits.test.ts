import { describe, it, expect, beforeEach } from 'vitest';
import app from '../src/index';
import { CaseService } from '../src/services/case.service';
import { AuditService } from '../src/services/audit.service';
import { ImageService } from '../src/services/image.service';

describe('Task 1 & Task 2: Image Editing & Inpainting Mask Endpoints', () => {
  beforeEach(() => {
    CaseService.clearMemory();
    AuditService.clearMemory();
    ImageService.clearMemory();
  });

  it('POST /api/images/:imageId/edits creates a new version linked to parent with mask', async () => {
    // 1. Generate base image
    const genRes = await app.request('/api/generations', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'x-user-id': 'usr_investigator_1'
      },
      body: JSON.stringify({
        caseId: 'case_sample_001',
        prompt: 'Male suspect in his 40s with round jaw and thin eyebrows',
        numCandidates: 1
      })
    }, { ENVIRONMENT: 'test', MOCK_AI: 'true' } as any);

    const genBody = await genRes.json() as any;
    const baseImage = genBody.data.candidates[0];
    expect(baseImage.version).toBe(1);

    // 2. Create a mock mask (100x100 white square in base64)
    const mockMaskBase64 = 'data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAYAAAAfFcSJAAAADUlEQVR42mP8z8BQDwAEhQGAhKmMIQAAAABJRU5ErkJggg==';

    // 3. Edit jawline
    const editRes = await app.request(`/api/images/${baseImage.id}/edits`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'x-user-id': 'usr_investigator_1'
      },
      body: JSON.stringify({
        prompt: 'Make the jawline much sharper, more angular and square',
        facialRegions: ['jawline', 'chin'],
        mask: mockMaskBase64,
        modelName: 'mock-forensic-inpainting-v1',
        parameters: {
          preserveBackground: true,
          guidanceScale: 8.0
        }
      })
    }, { ENVIRONMENT: 'test', MOCK_AI: 'true' } as any);

    expect(editRes.status).toBe(201);
    const editBody = await editRes.json() as any;
    expect(editBody.status).toBe('success');

    const editedImage = editBody.data;
    expect(editedImage.id).toMatch(/^img_/);
    expect(editedImage.id).not.toBe(baseImage.id); // Never overwrite earlier image
    expect(editedImage.parentImageId).toBe(baseImage.id); // Linked to parent
    expect(editedImage.version).toBe(2); // Version 2
    expect(editedImage.isActive).toBe(true);
    expect(editedImage.status).toBe('accepted');
    expect(editedImage.editInstruction).toBe('Make the jawline much sharper, more angular and square');
    expect(editedImage.facialRegions).toEqual(['jawline', 'chin']);
    expect(editedImage.r2MaskKey).toBeDefined();

    // 4. Verify parent image metadata now points to parent and is superseded
    const parentCheck = await app.request(`/api/images/${baseImage.id}`, {
      method: 'GET',
      headers: { 'x-user-id': 'usr_investigator_1' }
    }, { ENVIRONMENT: 'test', MOCK_AI: 'true' } as any);
    const parentBody = await parentCheck.json() as any;
    expect(parentBody.data.status).toBe('superseded');
    expect(parentBody.data.isActive).toBe(false);

    // 5. Fetch edited image with parent details populated
    const editedCheck = await app.request(`/api/images/${editedImage.id}`, {
      method: 'GET',
      headers: { 'x-user-id': 'usr_investigator_1' }
    }, { ENVIRONMENT: 'test', MOCK_AI: 'true' } as any);
    const editedCheckBody = await editedCheck.json() as any;
    expect(editedCheckBody.data.parent).toBeDefined();
    expect(editedCheckBody.data.parent.id).toBe(baseImage.id);

    // 6. Verify mask retrieval endpoint
    const maskRes = await app.request(`/api/images/${editedImage.id}/mask`, {
      method: 'GET',
      headers: { 'x-user-id': 'usr_investigator_1' }
    }, { ENVIRONMENT: 'test', MOCK_AI: 'true' } as any);
    expect(maskRes.status).toBe(200);
    expect(maskRes.headers.get('Content-Type')).toBe('image/png');
  });

  it('performs sequential edits maintaining revision memory context (Task 2)', async () => {
    // 1. Initial generation (v1)
    const genRes = await app.request('/api/generations', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json', 'x-user-id': 'usr_investigator_1' },
      body: JSON.stringify({
        caseId: 'case_sample_001',
        prompt: 'Suspect sketch with oval face and dark eyes',
        numCandidates: 1
      })
    }, { ENVIRONMENT: 'test', MOCK_AI: 'true' } as any);
    const v1 = (await genRes.json() as any).data.candidates[0];

    const mockMask = 'data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAYAAAAfFcSJAAAADUlEQVR42mP8z8BQDwAEhQGAhKmMIQAAAABJRU5ErkJggg==';

    // 2. Edit 1: Eyes (v2)
    const edit1Res = await app.request(`/api/images/${v1.id}/edits`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json', 'x-user-id': 'usr_investigator_1' },
      body: JSON.stringify({
        prompt: 'Make the eyes narrower and more squinted',
        facialRegions: ['eyes'],
        mask: mockMask
      })
    }, { ENVIRONMENT: 'test', MOCK_AI: 'true' } as any);
    const v2 = (await edit1Res.json() as any).data;
    expect(v2.version).toBe(2);
    expect(v2.parentImageId).toBe(v1.id);

    // 3. Edit 2: Jawline based on v2 (v3)
    const edit2Res = await app.request(`/api/images/${v2.id}/edits`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json', 'x-user-id': 'usr_investigator_1' },
      body: JSON.stringify({
        prompt: 'Add heavy 5 o clock stubble across chin and jawline',
        facialRegions: ['facial_hair', 'jawline'],
        mask: mockMask
      })
    }, { ENVIRONMENT: 'test', MOCK_AI: 'true' } as any);
    const v3 = (await edit2Res.json() as any).data;
    expect(v3.version).toBe(3);
    expect(v3.parentImageId).toBe(v2.id);

    // 4. Verify version history reflects full revision tree
    const historyRes = await app.request('/api/cases/case_sample_001/versions', {
      method: 'GET',
      headers: { 'x-user-id': 'usr_investigator_1' }
    }, { ENVIRONMENT: 'test', MOCK_AI: 'true' } as any);
    const historyBody = await historyRes.json() as any;
    expect(historyBody.data.versions.length).toBe(3);
    expect(historyBody.data.versions[0].version).toBe(1);
    expect(historyBody.data.versions[1].version).toBe(2);
    expect(historyBody.data.versions[2].version).toBe(3);
  });
});

