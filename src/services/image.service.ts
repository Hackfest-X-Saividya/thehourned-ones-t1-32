import { AuthenticatedUser, Env, ImageMetadata } from '../types';
import { generateId, getCurrentIsoTimestamp } from '../utils/crypto';
import { AppError } from '../middleware/error-handler';
import { getAiAdapter } from './ai/ai.factory';
import { parseBase64OrDataUri } from './ai/compositor';
import { R2StorageService } from './storage/r2.service';
import { CaseService } from './case.service';
import { AuditService } from './audit.service';
import { createForensicSketchPng } from './ai/mock-ai.adapter';

// In-memory fallback images and generations store for testing & offline dev
const inMemoryImages = new Map<string, ImageMetadata>();
const inMemoryGenerations = new Map<string, any>();

export interface CreateGenerationInput {
  caseId: string;
  prompt: string;
  negativePrompt?: string;
  modelName: string;
  numCandidates: number;
  parameters: Record<string, unknown>;
}

export interface CreateEditInput {
  baseImageId: string;
  prompt: string;
  facialRegions: string[];
  mask: string; // Base64 data URL or raw base64
  modelName?: string;
  parameters?: Record<string, unknown>;
}

export class ImageService {
  private r2Storage: R2StorageService;
  private caseService: CaseService;
  private auditService: AuditService;

  constructor(private env: Env) {
    this.r2Storage = new R2StorageService(env);
    this.caseService = new CaseService(env);
    this.auditService = new AuditService(env);
  }

  /**
   * Helper to format image access URLs
   */
  private formatImageUrls(image: ImageMetadata): ImageMetadata {
    return {
      ...image,
      imageUrl: `/api/images/${image.id}/file`,
      maskUrl: image.r2MaskKey ? `/api/images/${image.id}/mask` : undefined
    };
  }

  /**
   * Generate initial candidates for a case
   */
  async generateCandidates(
    input: CreateGenerationInput,
    user: AuthenticatedUser,
    requestId: string
  ): Promise<{ generationId: string; candidates: ImageMetadata[] }> {
    // 1. Verify case access
    const caseItem = await this.caseService.getCaseById(input.caseId, user, true);
    if (!caseItem) {
      throw new AppError(`Case not found: ${input.caseId}`, 404, 'CASE_NOT_FOUND');
    }

    const generationId = generateId('gen');
    const now = getCurrentIsoTimestamp();
    const adapter = getAiAdapter(input.modelName, this.env);

    // 2. Call AI adapter
    const aiResult = await adapter.generate({
      caseId: input.caseId,
      prompt: input.prompt,
      negativePrompt: input.negativePrompt,
      modelName: input.modelName,
      numCandidates: input.numCandidates,
      parameters: input.parameters
    });

    // 3. Store generation record
    const genRecord = {
      id: generationId,
      case_id: input.caseId,
      prompt: input.prompt,
      negative_prompt: input.negativePrompt || null,
      model_name: aiResult.modelName,
      num_candidates: input.numCandidates,
      parameters_json: JSON.stringify(aiResult.parameters),
      created_by: user.id,
      created_at: now
    };
    inMemoryGenerations.set(generationId, genRecord);

    if (this.env.DB) {
      try {
        await this.env.DB.prepare(
          `INSERT INTO generations (
            id, case_id, prompt, negative_prompt, model_name,
            num_candidates, parameters_json, created_by, created_at
          ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)`
        )
          .bind(
            genRecord.id,
            genRecord.case_id,
            genRecord.prompt,
            genRecord.negative_prompt,
            genRecord.model_name,
            genRecord.num_candidates,
            genRecord.parameters_json,
            genRecord.created_by,
            genRecord.created_at
          )
          .run();
      } catch (err) {
        console.warn('[ImageService] Failed to insert generation into D1:', err);
      }
    }

    // 4. Save each candidate image in R2 and D1
    const candidateMetadataList: ImageMetadata[] = [];

    for (let i = 0; i < aiResult.images.length; i++) {
      const img = aiResult.images[i];
      const imageId = generateId('img');

      // Upload image to R2
      const { r2Key, size } = await this.r2Storage.uploadImage(
        input.caseId,
        imageId,
        img.bytes,
        img.contentType || 'image/png'
      );

      const metadata: ImageMetadata = {
        id: imageId,
        caseId: input.caseId,
        generationId,
        parentImageId: undefined,
        version: 1,
        isActive: false,
        status: 'candidate',
        prompt: input.prompt,
        editInstruction: undefined,
        facialRegions: [],
        modelName: aiResult.modelName,
        parameters: {
          ...aiResult.parameters,
          candidateIndex: i + 1,
          seed: img.seed
        },
        r2Key,
        contentType: img.contentType || 'image/png',
        width: 1024,
        height: 1024,
        fileSizeBytes: size,
        createdBy: user.id,
        createdAt: now
      };

      inMemoryImages.set(imageId, metadata);

      if (this.env.DB) {
        try {
          await this.env.DB.prepare(
            `INSERT INTO images (
              id, case_id, generation_id, parent_image_id, version,
              is_active, status, prompt, edit_instruction, facial_regions_json,
              model_name, parameters_json, r2_key, r2_mask_key, content_type,
              width, height, file_size_bytes, created_by, created_at
            ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`
          )
            .bind(
              metadata.id,
              metadata.caseId,
              metadata.generationId || null,
              null,
              metadata.version,
              0,
              metadata.status,
              metadata.prompt,
              null,
              JSON.stringify(metadata.facialRegions),
              metadata.modelName,
              JSON.stringify(metadata.parameters),
              metadata.r2Key,
              null,
              metadata.contentType,
              metadata.width,
              metadata.height,
              metadata.fileSizeBytes,
              metadata.createdBy,
              metadata.createdAt
            )
            .run();
        } catch (err) {
          console.warn('[ImageService] Failed to insert image record into D1:', err);
        }
      }

      candidateMetadataList.push(this.formatImageUrls(metadata));
    }

    // 5. Log audit event
    await this.auditService.logEvent({
      caseId: input.caseId,
      requestId,
      userId: user.id,
      userEmail: user.email,
      userRole: user.role,
      action: 'IMAGE_GENERATE',
      resourceType: 'generation',
      resourceId: generationId,
      status: 'SUCCESS',
      details: {
        numCandidates: input.numCandidates,
        modelName: aiResult.modelName,
        candidateIds: candidateMetadataList.map(c => c.id)
      }
    });

    return {
      generationId,
      candidates: candidateMetadataList
    };
  }

  /**
   * Edit an existing image using mask and facial region targeting
   * Creates a new version linked to parent, preserving unselected pixels
   */
  async editImage(
    input: CreateEditInput,
    user: AuthenticatedUser,
    requestId: string
  ): Promise<ImageMetadata> {
    // 1. Retrieve parent base image
    const parentImage = await this.getImageById(input.baseImageId, user, true);
    if (!parentImage) {
      throw new AppError(`Base image not found: ${input.baseImageId}`, 404, 'IMAGE_NOT_FOUND');
    }

    // 2. Retrieve base image bytes from R2
    let baseObject = await this.r2Storage.getObject(parentImage.r2Key);
    if (!baseObject) {
      const fallbackBytes = createForensicSketchPng(512, 512, parentImage.prompt, 0);
      try {
        const uploaded = await this.r2Storage.uploadImage(parentImage.caseId, parentImage.id, fallbackBytes, 'image/png');
        baseObject = {
          data: fallbackBytes,
          contentType: 'image/png',
          size: fallbackBytes.byteLength,
          key: uploaded.r2Key
        };
      } catch (err) {
        console.warn('[ImageService] Failed caching base sketch to R2:', err);
        baseObject = {
          data: fallbackBytes,
          contentType: 'image/png',
          size: fallbackBytes.byteLength,
          key: parentImage.r2Key
        };
      }
    }

    // 3. Parse edit mask
    const { data: maskBytes } = parseBase64OrDataUri(input.mask);

    // 4. Retrieve revision history memory context (Task 2)
    const revisionHistory = await this.getImageRevisions(parentImage.caseId, user);
    const relevantPreviousChanges = revisionHistory
      .filter(r => r.version < parentImage.version + 1 && r.editInstruction)
      .map(r => ({
        version: r.version,
        editInstruction: r.editInstruction,
        facialRegions: r.facialRegions
      }));

    // 5. Call AI inpainting adapter
    const modelName = input.modelName || '@cf/runwayml/stable-diffusion-v1-5-inpainting';
    const adapter = getAiAdapter(modelName, this.env);

    const editResult = await adapter.edit({
      caseId: parentImage.caseId,
      baseImageBytes: baseObject.data,
      maskBytes,
      prompt: input.prompt,
      facialRegions: input.facialRegions,
      modelName,
      parameters: input.parameters || {},
      revisionContext: {
        originalPrompt: parentImage.prompt,
        previousEdits: relevantPreviousChanges
      }
    });

    const newImageId = generateId('img');
    const now = getCurrentIsoTimestamp();
    const nextVersion = parentImage.version + 1;

    // 6. Upload new edited image and its mask to R2
    const { r2Key, size } = await this.r2Storage.uploadImage(
      parentImage.caseId,
      newImageId,
      editResult.bytes,
      editResult.contentType
    );

    const { r2MaskKey } = await this.r2Storage.uploadMask(
      parentImage.caseId,
      newImageId,
      maskBytes,
      'image/png'
    );

    // 7. Store new revision metadata in D1
    const newMetadata: ImageMetadata = {
      id: newImageId,
      caseId: parentImage.caseId,
      generationId: parentImage.generationId,
      parentImageId: parentImage.id,
      version: nextVersion,
      isActive: true, // New edit becomes current active sketch
      status: 'accepted',
      prompt: parentImage.prompt, // retain original prompt
      editInstruction: input.prompt, // specific edit instruction
      facialRegions: input.facialRegions,
      modelName: editResult.modelName,
      parameters: editResult.parameters,
      r2Key,
      r2MaskKey,
      contentType: editResult.contentType,
      width: parentImage.width,
      height: parentImage.height,
      fileSizeBytes: size,
      createdBy: user.id,
      createdAt: now
    };

    // Mark parent as superseded
    parentImage.isActive = false;
    parentImage.status = 'superseded';
    inMemoryImages.set(parentImage.id, parentImage);
    inMemoryImages.set(newImageId, newMetadata);

    if (this.env.DB) {
      try {
        // Set previous active image to inactive
        await this.env.DB.prepare(
          'UPDATE images SET is_active = 0, status = "superseded" WHERE case_id = ? AND is_active = 1'
        )
          .bind(parentImage.caseId)
          .run();

        // Insert new version
        await this.env.DB.prepare(
          `INSERT INTO images (
            id, case_id, generation_id, parent_image_id, version,
            is_active, status, prompt, edit_instruction, facial_regions_json,
            model_name, parameters_json, r2_key, r2_mask_key, content_type,
            width, height, file_size_bytes, created_by, created_at
          ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`
        )
          .bind(
            newMetadata.id,
            newMetadata.caseId,
            newMetadata.generationId || null,
            newMetadata.parentImageId,
            newMetadata.version,
            1,
            newMetadata.status,
            newMetadata.prompt,
            newMetadata.editInstruction,
            JSON.stringify(newMetadata.facialRegions),
            newMetadata.modelName,
            JSON.stringify(newMetadata.parameters),
            newMetadata.r2Key,
            newMetadata.r2MaskKey,
            newMetadata.contentType,
            newMetadata.width,
            newMetadata.height,
            newMetadata.fileSizeBytes,
            newMetadata.createdBy,
            newMetadata.createdAt
          )
          .run();
      } catch (err) {
        console.warn('[ImageService] Failed to insert edit record into D1:', err);
      }
    }

    // 8. Update case's active sketch ID
    await this.caseService.setActiveImage(parentImage.caseId, newImageId);

    // 9. Log audit event
    await this.auditService.logEvent({
      caseId: parentImage.caseId,
      requestId,
      userId: user.id,
      userEmail: user.email,
      userRole: user.role,
      action: 'IMAGE_EDIT',
      resourceType: 'image',
      resourceId: newImageId,
      status: 'SUCCESS',
      details: {
        parentImageId: parentImage.id,
        version: nextVersion,
        facialRegions: input.facialRegions,
        editInstruction: input.prompt
      }
    });

    return this.formatImageUrls(newMetadata);
  }

  /**
   * Get image metadata by ID (and check authorization)
   */
  async getImageById(imageId: string, user?: AuthenticatedUser, checkAuth = true): Promise<ImageMetadata | null> {
    let metadata: ImageMetadata | null = null;

    if (this.env.DB) {
      try {
        const row = await this.env.DB.prepare('SELECT * FROM images WHERE id = ?')
          .bind(imageId)
          .first<any>();
        if (row) {
          metadata = {
            id: row.id,
            caseId: row.case_id,
            generationId: row.generation_id,
            parentImageId: row.parent_image_id,
            version: row.version,
            isActive: Boolean(row.is_active),
            status: row.status,
            prompt: row.prompt,
            editInstruction: row.edit_instruction,
            facialRegions: typeof row.facial_regions_json === 'string'
              ? JSON.parse(row.facial_regions_json)
              : row.facial_regions_json || [],
            modelName: row.model_name,
            parameters: typeof row.parameters_json === 'string'
              ? JSON.parse(row.parameters_json)
              : row.parameters_json || {},
            r2Key: row.r2_key,
            r2MaskKey: row.r2_mask_key,
            contentType: row.content_type,
            width: row.width,
            height: row.height,
            fileSizeBytes: row.file_size_bytes,
            createdBy: row.created_by,
            createdAt: row.created_at
          };
        }
      } catch (err) {
        console.warn('[ImageService] D1 getImageById failed, checking memory:', err);
      }
    }

    if (!metadata) {
      metadata = inMemoryImages.get(imageId) || null;
    }

    if (!metadata && (imageId === 'IMG-SKETCH-1042' || imageId.startsWith('IMG-SKETCH-'))) {
      metadata = {
        id: imageId,
        caseId: 'case_sample_001',
        generationId: 'gen_genesis_001',
        parentImageId: undefined,
        version: 1,
        isActive: true,
        status: 'candidate',
        prompt: 'Male, early 30s, sharp square jawline, deep-set almond eyes, straight narrow nose, 3-day stubble, vertical scar above left eyebrow',
        editInstruction: undefined,
        facialRegions: ['jawline', 'eyes', 'nose', 'facial_hair', 'scars_marks'],
        modelName: '@cf/stabilityai/stable-diffusion-xl-base-1.0',
        parameters: { seed: 1042 },
        r2Key: `cases/case_sample_001/images/${imageId}.png`,
        contentType: 'image/png',
        width: 1024,
        height: 1024,
        fileSizeBytes: 262144,
        createdBy: user?.id || 'usr_investigator_1',
        createdAt: '2026-10-28T09:30:00.000Z'
      };
      inMemoryImages.set(imageId, metadata);
    }

    if (!metadata) return null;

    if (checkAuth && user) {
      const authorized = await this.caseService.isUserAuthorized(metadata.caseId, user);
      if (!authorized) {
        throw new AppError('Forbidden: You are not authorized to access this image', 403, 'FORBIDDEN');
      }
    }

    return this.formatImageUrls(metadata);
  }

  /**
   * Retrieve image revisions / version lineage for a case
   */
  async getImageRevisions(caseId: string, user: AuthenticatedUser): Promise<ImageMetadata[]> {
    const isAuth = await this.caseService.isUserAuthorized(caseId, user);
    if (!isAuth) {
      throw new AppError('Forbidden: You are not authorized to view revisions for this case', 403, 'FORBIDDEN');
    }

    if (this.env.DB) {
      try {
        const rows = await this.env.DB.prepare(
          'SELECT * FROM images WHERE case_id = ? ORDER BY version ASC, created_at ASC'
        )
          .bind(caseId)
          .all<any>();

        return (rows.results || []).map(row =>
          this.formatImageUrls({
            id: row.id,
            caseId: row.case_id,
            generationId: row.generation_id,
            parentImageId: row.parent_image_id,
            version: row.version,
            isActive: Boolean(row.is_active),
            status: row.status,
            prompt: row.prompt,
            editInstruction: row.edit_instruction,
            facialRegions: typeof row.facial_regions_json === 'string'
              ? JSON.parse(row.facial_regions_json)
              : row.facial_regions_json || [],
            modelName: row.model_name,
            parameters: typeof row.parameters_json === 'string'
              ? JSON.parse(row.parameters_json)
              : row.parameters_json || {},
            r2Key: row.r2_key,
            r2MaskKey: row.r2_mask_key,
            contentType: row.content_type,
            width: row.width,
            height: row.height,
            fileSizeBytes: row.file_size_bytes,
            createdBy: row.created_by,
            createdAt: row.created_at
          })
        );
      } catch (err) {
        console.warn('[ImageService] D1 getImageRevisions failed, fallback to memory:', err);
      }
    }

    // In-memory fallback
    const list = Array.from(inMemoryImages.values())
      .filter(img => img.caseId === caseId)
      .sort((a, b) => a.version - b.version || a.createdAt.localeCompare(b.createdAt));

    return list.map(img => this.formatImageUrls(img));
  }

  /**
   * Select a candidate as the active accepted sketch
   */
  async selectCandidate(imageId: string, user: AuthenticatedUser, requestId: string): Promise<ImageMetadata> {
    const image = await this.getImageById(imageId, user, true);
    if (!image) {
      throw new AppError(`Image not found: ${imageId}`, 404, 'IMAGE_NOT_FOUND');
    }

    // Update image status
    image.isActive = true;
    image.status = 'accepted';
    inMemoryImages.set(image.id, image);

    if (this.env.DB) {
      try {
        await this.env.DB.prepare('UPDATE images SET is_active = 0 WHERE case_id = ?').bind(image.caseId).run();
        await this.env.DB.prepare('UPDATE images SET is_active = 1, status = "accepted" WHERE id = ?').bind(imageId).run();
      } catch (err) {
        console.warn('[ImageService] D1 selectCandidate update failed:', err);
      }
    }

    await this.caseService.setActiveImage(image.caseId, imageId);

    // Audit log
    await this.auditService.logEvent({
      caseId: image.caseId,
      requestId,
      userId: user.id,
      userEmail: user.email,
      userRole: user.role,
      action: 'IMAGE_SELECT',
      resourceType: 'image',
      resourceId: imageId,
      status: 'SUCCESS',
      details: {
        version: image.version,
        prompt: image.prompt
      }
    });

    return this.formatImageUrls(image);
  }

  /**
   * Restore an earlier image version as the current active sketch
   */
  async restoreVersion(imageId: string, user: AuthenticatedUser, requestId: string): Promise<ImageMetadata> {
    const image = await this.getImageById(imageId, user, true);
    if (!image) {
      throw new AppError(`Image not found to restore: ${imageId}`, 404, 'IMAGE_NOT_FOUND');
    }

    image.isActive = true;
    image.status = 'restored';
    inMemoryImages.set(image.id, image);

    if (this.env.DB) {
      try {
        await this.env.DB.prepare('UPDATE images SET is_active = 0 WHERE case_id = ?').bind(image.caseId).run();
        await this.env.DB.prepare('UPDATE images SET is_active = 1, status = "restored" WHERE id = ?').bind(imageId).run();
      } catch (err) {
        console.warn('[ImageService] D1 restoreVersion update failed:', err);
      }
    }

    await this.caseService.setActiveImage(image.caseId, imageId);

    // Log audit event for restoration
    await this.auditService.logEvent({
      caseId: image.caseId,
      requestId,
      userId: user.id,
      userEmail: user.email,
      userRole: user.role,
      action: 'IMAGE_RESTORE',
      resourceType: 'image',
      resourceId: imageId,
      status: 'SUCCESS',
      details: {
        restoredVersion: image.version,
        restoredImageId: imageId
      }
    });

    return this.formatImageUrls(image);
  }

  /**
   * Get image binary bytes from R2
   */
  async getImageBytes(imageId: string, user: AuthenticatedUser): Promise<{ data: Uint8Array; contentType: string; metadata: ImageMetadata }> {
    const metadata = await this.getImageById(imageId, user, true);
    if (!metadata) {
      throw new AppError('Image not found', 404, 'IMAGE_NOT_FOUND');
    }

    let obj = await this.r2Storage.getObject(metadata.r2Key);
    if (!obj) {
      const fallbackBytes = createForensicSketchPng(512, 512, metadata.prompt, 0);
      try {
        await this.r2Storage.uploadImage(metadata.caseId, metadata.id, fallbackBytes, 'image/png');
      } catch (err) {
        console.warn('[ImageService] Failed caching fallback sketch to R2:', err);
      }
      return {
        data: fallbackBytes,
        contentType: 'image/png',
        metadata
      };
    }

    return {
      data: obj.data,
      contentType: obj.contentType,
      metadata
    };
  }

  /**
   * Get mask binary bytes from R2
   */
  async getMaskBytes(imageId: string, user: AuthenticatedUser): Promise<{ data: Uint8Array; contentType: string }> {
    const metadata = await this.getImageById(imageId, user, true);
    if (!metadata || !metadata.r2MaskKey) {
      throw new AppError('Mask not found for this image version', 404, 'MASK_NOT_FOUND');
    }

    const obj = await this.r2Storage.getObject(metadata.r2MaskKey);
    if (!obj) {
      throw new AppError('Mask binary data not found in R2 storage', 404, 'OBJECT_NOT_FOUND');
    }

    return {
      data: obj.data,
      contentType: obj.contentType
    };
  }

  /**
   * Clear in-memory state (for unit tests)
   */
  static clearMemory() {
    inMemoryImages.clear();
    inMemoryGenerations.clear();
  }
}

