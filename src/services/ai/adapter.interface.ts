// AI Generation and Editing Adapter Interface

export interface GenerateCandidateParams {
  caseId: string;
  prompt: string;
  negativePrompt?: string;
  modelName: string;
  numCandidates: number;
  parameters: Record<string, unknown>;
}

export interface EditImageParams {
  caseId: string;
  baseImageBytes: Uint8Array;
  maskBytes: Uint8Array;
  prompt: string;
  facialRegions: string[];
  modelName: string;
  parameters: Record<string, unknown>;
  revisionContext?: {
    originalPrompt?: string;
    previousEdits?: Array<{
      version: number;
      editInstruction?: string;
      facialRegions: string[];
    }>;
  };
}

export interface GenerateResult {
  images: Array<{
    bytes: Uint8Array;
    seed?: number;
    contentType: string;
  }>;
  modelName: string;
  parameters: Record<string, unknown>;
}

export interface EditResult {
  bytes: Uint8Array;
  modelName: string;
  contentType: string;
  parameters: Record<string, unknown>;
}

export interface AiAdapter {
  generate(params: GenerateCandidateParams): Promise<GenerateResult>;
  edit(params: EditImageParams): Promise<EditResult>;
}

