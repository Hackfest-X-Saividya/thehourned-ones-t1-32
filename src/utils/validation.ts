import { z } from 'zod';

// Allowed facial region tags for crime scene sketch editing
export const ALLOWED_FACIAL_REGIONS = [
  'eyes',
  'eyebrows',
  'nose',
  'mouth',
  'lips',
  'jawline',
  'chin',
  'forehead',
  'cheeks',
  'ears',
  'hair',
  'facial_hair',
  'accessories',
  'scars_marks',
  'overall_expression',
  'custom'
] as const;

export const SUPPORTED_AI_MODELS = [
  '@cf/stabilityai/stable-diffusion-xl-base-1.0',
  '@cf/bytedance/stable-diffusion-xl-lightning',
  '@cf/runwayml/stable-diffusion-v1-5-inpainting',
  'dall-e-3',
  'dall-e-2',
  'mock-forensic-pencil-v1'
] as const;

// 1. Case Schemas
export const createCaseSchema = z.object({
  caseNumber: z.string().min(2).max(50).optional(),
  title: z.string().min(3).max(200),
  description: z.string().max(2000).optional(),
  status: z.enum(['open', 'active_investigation', 'cold_case', 'closed']).default('open'),
  incidentDate: z.string().datetime().optional().or(z.string().regex(/^\d{4}-\d{2}-\d{2}/).optional()),
  assignedInvestigatorId: z.string().optional()
});

export const updateCaseSchema = z.object({
  title: z.string().min(3).max(200).optional(),
  description: z.string().max(2000).optional(),
  status: z.enum(['open', 'active_investigation', 'cold_case', 'closed']).optional(),
  incidentDate: z.string().optional(),
  assignedInvestigatorId: z.string().optional()
});

// 2. Generation Schemas
export const createGenerationSchema = z.object({
  caseId: z.string().min(1, 'caseId is required'),
  prompt: z.string().min(3, 'prompt must be at least 3 characters').max(1500),
  negativePrompt: z.string().max(1000).optional(),
  modelName: z.string().default('@cf/stabilityai/stable-diffusion-xl-base-1.0'),
  numCandidates: z.number().int().min(1).max(4).default(1),
  parameters: z.object({
    seed: z.number().int().optional(),
    guidanceScale: z.number().min(1).max(20).optional(),
    numInferenceSteps: z.number().int().min(10).max(100).optional(),
    stylePreset: z.string().optional(),
    aspectRatio: z.string().optional()
  }).passthrough().default({})
});

// 3. Edit Schemas
export const createEditSchema = z.object({
  prompt: z.string().min(3, 'Edit instruction/prompt is required').max(1500),
  facialRegions: z.array(z.string()).min(1, 'At least one facial region must be specified'),
  mask: z.string().min(10, 'Mask image must be provided as base64 or data URL'),
  modelName: z.string().default('@cf/runwayml/stable-diffusion-v1-5-inpainting'),
  parameters: z.object({
    seed: z.number().int().optional(),
    guidanceScale: z.number().min(1).max(20).optional(),
    numInferenceSteps: z.number().int().min(10).max(100).optional(),
    preserveBackground: z.boolean().default(true),
    featherRadius: z.number().int().min(0).max(20).default(2)
  }).passthrough().default({})
});

// 4. Case Access Grant Schema
export const grantAccessSchema = z.object({
  userId: z.string().min(1),
  permission: z.enum(['read', 'write', 'admin']).default('read')
});

// 5. Query Filters
export const listCasesQuerySchema = z.object({
  status: z.enum(['open', 'active_investigation', 'cold_case', 'closed']).optional(),
  search: z.string().optional(),
  limit: z.coerce.number().int().min(1).max(100).default(20),
  offset: z.coerce.number().int().min(0).default(0)
});

export const listAuditQuerySchema = z.object({
  action: z.string().optional(),
  userId: z.string().optional(),
  status: z.enum(['SUCCESS', 'FAILURE']).optional(),
  startDate: z.string().optional(),
  endDate: z.string().optional(),
  limit: z.coerce.number().int().min(1).max(100).default(50),
  offset: z.coerce.number().int().min(0).default(0)
});

