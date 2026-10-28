import { Hono } from 'hono';
import { Env, HonoVariables } from '../types';
import { createGenerationSchema } from '../utils/validation';
import { ImageService } from '../services/image.service';

export const generationsRouter = new Hono<{ Bindings: Env; Variables: HonoVariables }>();

/**
 * POST /api/generations — Generate candidate sketches from forensic witness description
 */
generationsRouter.post('/', async (c) => {
  const user = c.get('user');
  const requestId = c.get('requestId');
  const body = await c.req.json();
  const parsed = createGenerationSchema.parse(body);

  const imageService = new ImageService(c.env);

  const result = await imageService.generateCandidates(
    {
      caseId: parsed.caseId,
      prompt: parsed.prompt,
      negativePrompt: parsed.negativePrompt,
      modelName: parsed.modelName,
      numCandidates: parsed.numCandidates,
      parameters: parsed.parameters
    },
    user,
    requestId
  );

  return c.json(
    {
      status: 'success',
      data: {
        generationId: result.generationId,
        caseId: parsed.caseId,
        prompt: parsed.prompt,
        modelName: parsed.modelName,
        totalCandidates: result.candidates.length,
        candidates: result.candidates
      }
    },
    201
  );
});

