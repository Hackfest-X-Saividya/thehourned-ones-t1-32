import { Hono } from 'hono';
import { Env, HonoVariables } from '../types';
import { createEditSchema } from '../utils/validation';
import { ImageService } from '../services/image.service';
import { AuditService } from '../services/audit.service';
import { AppError } from '../middleware/error-handler';

export const imagesRouter = new Hono<{ Bindings: Env; Variables: HonoVariables }>();

/**
 * GET /api/images/:imageId — Retrieve image metadata and its parent version
 */
imagesRouter.get('/:imageId', async (c) => {
  const user = c.get('user');
  const imageId = c.req.param('imageId');
  const imageService = new ImageService(c.env);

  const image = await imageService.getImageById(imageId, user, true);
  if (!image) {
    throw new AppError(`Image not found: ${imageId}`, 404, 'IMAGE_NOT_FOUND');
  }

  let parentImage = null;
  if (image.parentImageId) {
    parentImage = await imageService.getImageById(image.parentImageId, user, false);
  }

  return c.json({
    status: 'success',
    data: {
      ...image,
      parent: parentImage
    }
  });
});

/**
 * GET /api/images/:imageId/file — Serve authenticated image binary from private R2 bucket
 */
imagesRouter.get('/:imageId/file', async (c) => {
  const user = c.get('user');
  const imageId = c.req.param('imageId');
  const imageService = new ImageService(c.env);

  const { data, contentType, metadata } = await imageService.getImageBytes(imageId, user);

  return new Response(data, {
    status: 200,
    headers: {
      'Content-Type': contentType || 'image/png',
      'Content-Length': data.byteLength.toString(),
      'Cache-Control': 'private, no-transform, max-age=3600',
      'ETag': `"${metadata.id}-${metadata.version}"`,
      'Content-Disposition': `inline; filename="sketch-${metadata.caseId}-v${metadata.version}.png"`
    }
  });
});

/**
 * GET /api/images/:imageId/mask — Serve authenticated mask binary from R2 bucket
 */
imagesRouter.get('/:imageId/mask', async (c) => {
  const user = c.get('user');
  const imageId = c.req.param('imageId');
  const imageService = new ImageService(c.env);

  const { data, contentType } = await imageService.getMaskBytes(imageId, user);

  return new Response(data, {
    status: 200,
    headers: {
      'Content-Type': contentType || 'image/png',
      'Content-Length': data.byteLength.toString(),
      'Cache-Control': 'private, no-transform, max-age=3600'
    }
  });
});

/**
 * POST /api/images/:imageId/edits — Region-specific inpainting edit
 * Creates a new version linked to parent, preserving unselected pixels
 */
imagesRouter.post('/:imageId/edits', async (c) => {
  const user = c.get('user');
  const requestId = c.get('requestId');
  const imageId = c.req.param('imageId');
  const body = await c.req.json();
  const parsed = createEditSchema.parse(body);

  const imageService = new ImageService(c.env);

  const newRevision = await imageService.editImage(
    {
      baseImageId: imageId,
      prompt: parsed.prompt,
      facialRegions: parsed.facialRegions,
      mask: parsed.mask,
      modelName: parsed.modelName,
      parameters: parsed.parameters
    },
    user,
    requestId
  );

  return c.json(
    {
      status: 'success',
      data: newRevision
    },
    201
  );
});

/**
 * POST /api/images/:imageId/select — Select a candidate as the active sketch
 */
imagesRouter.post('/:imageId/select', async (c) => {
  const user = c.get('user');
  const requestId = c.get('requestId');
  const imageId = c.req.param('imageId');

  const imageService = new ImageService(c.env);
  const selected = await imageService.selectCandidate(imageId, user, requestId);

  return c.json({
    status: 'success',
    data: selected
  });
});

/**
 * POST /api/images/:imageId/restore — Restore an earlier version as the current sketch
 */
imagesRouter.post('/:imageId/restore', async (c) => {
  const user = c.get('user');
  const requestId = c.get('requestId');
  const imageId = c.req.param('imageId');

  const imageService = new ImageService(c.env);
  const restored = await imageService.restoreVersion(imageId, user, requestId);

  return c.json({
    status: 'success',
    data: restored
  });
});

/**
 * GET /api/images/:imageId/compare/:otherImageId — Version comparison endpoint
 */
imagesRouter.get('/:imageId/compare/:otherImageId', async (c) => {
  const user = c.get('user');
  const imageId = c.req.param('imageId');
  const otherImageId = c.req.param('otherImageId');

  const imageService = new ImageService(c.env);

  const img1 = await imageService.getImageById(imageId, user, true);
  const img2 = await imageService.getImageById(otherImageId, user, true);

  if (!img1 || !img2) {
    throw new AppError('One or both images not found for comparison', 404, 'IMAGE_NOT_FOUND');
  }

  if (img1.caseId !== img2.caseId) {
    throw new AppError('Cannot compare images from different cases', 400, 'CROSS_CASE_COMPARISON_INVALID');
  }

  return c.json({
    status: 'success',
    data: {
      caseId: img1.caseId,
      versionA: {
        id: img1.id,
        version: img1.version,
        prompt: img1.prompt,
        editInstruction: img1.editInstruction,
        facialRegions: img1.facialRegions,
        modelName: img1.modelName,
        createdAt: img1.createdAt,
        imageUrl: img1.imageUrl,
        maskUrl: img1.maskUrl
      },
      versionB: {
        id: img2.id,
        version: img2.version,
        prompt: img2.prompt,
        editInstruction: img2.editInstruction,
        facialRegions: img2.facialRegions,
        modelName: img2.modelName,
        createdAt: img2.createdAt,
        imageUrl: img2.imageUrl,
        maskUrl: img2.maskUrl
      },
      diff: {
        versionDifference: Math.abs(img1.version - img2.version),
        promptChanged: img1.prompt !== img2.prompt,
        editInstructionChanged: img1.editInstruction !== img2.editInstruction,
        regionsChanged: Array.from(new Set([...img1.facialRegions, ...img2.facialRegions]))
      }
    }
  });
});

/**
 * POST /api/images/:imageId/export — Export sketch with audit logging
 */
imagesRouter.post('/:imageId/export', async (c) => {
  const user = c.get('user');
  const requestId = c.get('requestId');
  const imageId = c.req.param('imageId');
  const imageService = new ImageService(c.env);
  const auditService = new AuditService(c.env);

  const image = await imageService.getImageById(imageId, user, true);
  if (!image) {
    throw new AppError(`Image not found: ${imageId}`, 404, 'IMAGE_NOT_FOUND');
  }

  // Audit log export event
  await auditService.logEvent({
    caseId: image.caseId,
    requestId,
    userId: user.id,
    userEmail: user.email,
    userRole: user.role,
    action: 'IMAGE_EXPORT',
    resourceType: 'image',
    resourceId: imageId,
    status: 'SUCCESS',
    details: {
      version: image.version,
      modelName: image.modelName
    }
  });

  return c.json({
    status: 'success',
    data: {
      message: 'Forensic sketch export registered successfully',
      imageId: image.id,
      downloadUrl: `/api/images/${image.id}/file`,
      version: image.version,
      exportedAt: new Date().toISOString()
    }
  });
});

