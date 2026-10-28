// Cloudflare Workers & Application Types

export type UserRole = 'investigator' | 'lead_investigator' | 'admin' | 'analyst';

export interface User {
  id: string;
  name: string;
  email: string;
  role: UserRole;
  badgeNumber?: string;
  createdAt: string;
}

export type CaseStatus = 'open' | 'active_investigation' | 'cold_case' | 'closed';

export interface Case {
  id: string;
  caseNumber: string;
  title: string;
  description?: string;
  status: CaseStatus;
  incidentDate?: string;
  assignedInvestigatorId: string;
  activeImageId?: string;
  createdAt: string;
  updatedAt: string;
}

export type CasePermission = 'read' | 'write' | 'admin';

export interface CaseAccess {
  id: string;
  caseId: string;
  userId: string;
  permission: CasePermission;
  grantedAt: string;
}

export interface Generation {
  id: string;
  caseId: string;
  prompt: string;
  negativePrompt?: string;
  modelName: string;
  numCandidates: number;
  parameters: Record<string, unknown>;
  createdBy: string;
  createdAt: string;
}

export type ImageStatus = 'candidate' | 'accepted' | 'superseded' | 'restored' | 'archived';

export interface ImageMetadata {
  id: string;
  caseId: string;
  generationId?: string;
  parentImageId?: string;
  version: number;
  isActive: boolean;
  status: ImageStatus;
  prompt: string;
  editInstruction?: string;
  facialRegions: string[];
  modelName: string;
  parameters: Record<string, unknown>;
  r2Key: string;
  r2MaskKey?: string;
  contentType: string;
  width: number;
  height: number;
  fileSizeBytes: number;
  createdBy: string;
  createdAt: string;
  imageUrl?: string;
  maskUrl?: string;
}

export type AuditAction =
  | 'CASE_CREATE'
  | 'CASE_VIEW'
  | 'IMAGE_GENERATE'
  | 'IMAGE_SELECT'
  | 'IMAGE_EDIT'
  | 'IMAGE_RESTORE'
  | 'IMAGE_EXPORT'
  | 'UNAUTHORIZED_ACCESS'
  | 'AUDIT_VIEW';

export type AuditResourceType = 'case' | 'generation' | 'image' | 'audit';
export type AuditStatus = 'SUCCESS' | 'FAILURE';

export interface AuditLogEntry {
  id: string;
  caseId?: string;
  requestId: string;
  userId: string;
  userEmail?: string;
  userRole?: string;
  action: AuditAction;
  resourceType: AuditResourceType;
  resourceId?: string;
  status: AuditStatus;
  ipAddress?: string;
  userAgent?: string;
  details: Record<string, unknown>;
  timestamp: string;
}

export interface Env {
  DB: D1Database;
  BUCKET: R2Bucket;
  AI?: any; // Cloudflare Workers AI binding
  ENVIRONMENT?: string;
  MOCK_AI?: string;
  JWT_SECRET?: string;
  EXTERNAL_AI_API_KEY?: string;
  EXTERNAL_AI_URL?: string;
  EXTERNAL_WORKER_URL?: string;
  EXTERNAL_WORKER_TOKEN?: string;
  CLOUDFLARE_WORKER_URL?: string;
  CLOUDFLARE_WORKER_TOKEN?: string;
  MAX_FILE_SIZE_BYTES?: string;
  DEFAULT_IMAGE_WIDTH?: string;
  DEFAULT_IMAGE_HEIGHT?: string;
}

export interface AuthenticatedUser {
  id: string;
  email: string;
  name: string;
  role: UserRole;
  badgeNumber?: string;
}

export interface HonoVariables {
  user: AuthenticatedUser;
  requestId: string;
}

