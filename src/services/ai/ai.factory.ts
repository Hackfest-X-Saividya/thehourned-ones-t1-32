import { Env } from '../../types';
import { AiAdapter } from './adapter.interface';
import { ExternalAiAdapter } from './external-ai.adapter';
import { MockAiAdapter } from './mock-ai.adapter';
import { WorkersAiAdapter } from './workers-ai.adapter';

export function getAiAdapter(modelName: string | undefined, env: Env): AiAdapter {
  if (env.MOCK_AI === 'true' || !modelName || modelName.startsWith('mock')) {
    return new MockAiAdapter();
  }

  if (modelName.startsWith('dall-e') || modelName.startsWith('external')) {
    return new ExternalAiAdapter(env);
  }

  // Cloudflare Workers AI model by default
  return new WorkersAiAdapter(env);
}

