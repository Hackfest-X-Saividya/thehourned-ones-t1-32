import { describe, it, expect, beforeEach } from 'vitest';
import app from '../src/index';
import { CaseService } from '../src/services/case.service';
import { AuditService } from '../src/services/audit.service';
import { ImageService } from '../src/services/image.service';

describe('Task 1 & Task 2: Version History, Selection, Restoration & Comparison', () => {
  beforeEach(() => {
    CaseService.clearMemory();
    AuditService.clearMemory();
    ImageService.clearMemory();
  });

  it('selects a candidate image and sets it as the active case sketch', async () => {
    // Generate candidates
    const genRes = await app.request('/api/generations', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json', 'x-user-id': 'usr_investigator_1' },
      body: JSON.stringify({
        caseId: 'case_sample_001',
        prompt: 'Forensic sketch candidate generation',
        numCandidates: 2
      })
    }, { ENVIRONMENT: 'test', MOCK_AI: 'true' } as any);

    const candidates = (await genRes.json() as any).data.candidates;
    const candidateToSelect = candidates[1];

    // Select candidate
    const selectRes = await app.request(`/api/images/${candidateToSelect.id}/select`, {
      method: 'POST',
      headers: { 'x-user-id': 'usr_investigator_1' }
    }, { ENVIRONMENT: 'test', MOCK_AI: 'true' } as any);

    expect(selectRes.status).toBe(200);
    const selectBody = await selectRes.json() as any;
    expect(selectBody.data.isActive).toBe(true);
    expect(selectBody.data.status).toBe('accepted');

    // Verify case activeImageId updated
    const caseRes = await app.request('/api/cases/case_sample_001', {
      method: 'GET',
      headers: { 'x-user-id': 'usr_investigator_1' }
    }, { ENVIRONMENT: 'test', MOCK_AI: 'true' } as any);
    const caseBody = await caseRes.json() as any;
    expect(caseBody.data.activeImageId).toBe(candidateToSelect.id);
  });

  it('restores an earlier image version and logs IMAGE_RESTORE event', async () => {
    // 1. Generate v1
    const genRes = await app.request('/api/generations', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json', 'x-user-id': 'usr_investigator_1' },
      body: JSON.stringify({
        caseId: 'case_sample_001',
        prompt: 'Initial sketch v1',
        numCandidates: 1
      })
    }, { ENVIRONMENT: 'test', MOCK_AI: 'true' } as any);
    const v1 = (await genRes.json() as any).data.candidates[0];

    // 2. Edit to create v2
    const mockMask = 'data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAYAAAAfFcSJAAAADUlEQVR42mP8z8BQDwAEhQGAhKmMIQAAAABJRU5ErkJggg==';
    const editRes = await app.request(`/api/images/${v1.id}/edits`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json', 'x-user-id': 'usr_investigator_1' },
      body: JSON.stringify({
        prompt: 'Alter cheekbones',
        facialRegions: ['cheeks'],
        mask: mockMask
      })
    }, { ENVIRONMENT: 'test', MOCK_AI: 'true' } as any);
    const v2 = (await editRes.json() as any).data;

    // Currently v2 is active
    expect(v2.isActive).toBe(true);

    // 3. Witness decides v1 was actually more accurate! Restore v1
    const restoreRes = await app.request(`/api/images/${v1.id}/restore`, {
      method: 'POST',
      headers: { 'x-user-id': 'usr_investigator_1' }
    }, { ENVIRONMENT: 'test', MOCK_AI: 'true' } as any);

    expect(restoreRes.status).toBe(200);
    const restoreBody = await restoreRes.json() as any;
    expect(restoreBody.data.id).toBe(v1.id);
    expect(restoreBody.data.isActive).toBe(true);
    expect(restoreBody.data.status).toBe('restored');

    // 4. Verify case active image is now restored to v1
    const caseRes = await app.request('/api/cases/case_sample_001', {
      method: 'GET',
      headers: { 'x-user-id': 'usr_investigator_1' }
    }, { ENVIRONMENT: 'test', MOCK_AI: 'true' } as any);
    expect((await caseRes.json() as any).data.activeImageId).toBe(v1.id);

    // 5. Verify audit log recorded IMAGE_RESTORE
    const auditRes = await app.request('/api/cases/case_sample_001/audit', {
      method: 'GET',
      headers: { 'x-user-id': 'usr_investigator_1' }
    }, { ENVIRONMENT: 'test', MOCK_AI: 'true' } as any);
    const auditEvents = (await auditRes.json() as any).data;
    const restoreEvent = auditEvents.find((e: any) => e.action === 'IMAGE_RESTORE');
    expect(restoreEvent).toBeDefined();
    expect(restoreEvent.resourceId).toBe(v1.id);
  });

  it('compares two sketch revisions returning differential changes', async () => {
    // 1. Generate v1
    const genRes = await app.request('/api/generations', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json', 'x-user-id': 'usr_investigator_1' },
      body: JSON.stringify({
        caseId: 'case_sample_001',
        prompt: 'Forensic sketch comparison test',
        numCandidates: 1
      })
    }, { ENVIRONMENT: 'test', MOCK_AI: 'true' } as any);
    const v1 = (await genRes.json() as any).data.candidates[0];

    // 2. Edit to v2
    const mockMask = 'data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAYAAAAfFcSJAAAADUlEQVR42mP8z8BQDwAEhQGAhKmMIQAAAABJRU5ErkJggg==';
    const editRes = await app.request(`/api/images/${v1.id}/edits`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json', 'x-user-id': 'usr_investigator_1' },
      body: JSON.stringify({
        prompt: 'Widen nasal bridge',
        facialRegions: ['nose'],
        mask: mockMask
      })
    }, { ENVIRONMENT: 'test', MOCK_AI: 'true' } as any);
    const v2 = (await editRes.json() as any).data;

    // 3. Compare v1 and v2
    const compareRes = await app.request(`/api/images/${v1.id}/compare/${v2.id}`, {
      method: 'GET',
      headers: { 'x-user-id': 'usr_investigator_1' }
    }, { ENVIRONMENT: 'test', MOCK_AI: 'true' } as any);

    expect(compareRes.status).toBe(200);
    const compareBody = await compareRes.json() as any;
    expect(compareBody.data.diff.versionDifference).toBe(1);
    expect(compareBody.data.diff.regionsChanged).toContain('nose');
  });
});

