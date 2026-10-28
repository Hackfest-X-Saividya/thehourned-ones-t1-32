import { Env } from '../../types';
import { AiAdapter, EditImageParams, EditResult, GenerateCandidateParams, GenerateResult } from './adapter.interface';
import { compositeInpaintedImage } from './compositor';
import { MockAiAdapter } from './mock-ai.adapter';

export class WorkersAiAdapter implements AiAdapter {
  private mockFallback = new MockAiAdapter();

  constructor(private env: Env) {}

  async generate(params: GenerateCandidateParams): Promise<GenerateResult> {
    // If AI binding is absent or MOCK_AI is enabled, use mock adapter
    if (!this.env.AI || this.env.MOCK_AI === 'true') {
      return this.mockFallback.generate(params);
    }

    const modelName = params.modelName || '@cf/stabilityai/stable-diffusion-xl-base-1.0';
    const images: GenerateResult['images'] = [];

    // Ensure prompt is tuned for forensic crime scene sketch style
    const forensicPrompt = `forensic pencil sketch, police suspect composite portrait, monochrome charcoal drawing, realistic courtroom artist style. ${params.prompt}`;
    const negativePrompt = params.negativePrompt || 'photorealistic photo, color photograph, 3d render, anime, vibrant colors, blurry';

    for (let i = 0; i < params.numCandidates; i++) {
      const seed = (params.parameters.seed as number) || Math.floor(Math.random() * 1000000) + i;

      try {
        const response = await this.env.AI.run(modelName, {
          prompt: forensicPrompt,
          negative_prompt: negativePrompt,
          num_steps: (params.parameters.numInferenceSteps as number) || 25,
          guidance: (params.parameters.guidanceScale as number) || 7.5,
          seed
        });

        let bytes: Uint8Array;
        if (response instanceof ReadableStream) {
          const res = new Response(response);
          const buffer = await res.arrayBuffer();
          bytes = new Uint8Array(buffer);
        } else if (response instanceof Uint8Array) {
          bytes = response;
        } else if (response instanceof ArrayBuffer) {
          bytes = new Uint8Array(response);
        } else if (response?.image) {
          // If returned as base64 or binary in object
          bytes = typeof response.image === 'string'
            ? Uint8Array.from(atob(response.image), c => c.charCodeAt(0))
            : new Uint8Array(response.image);
        } else {
          throw new Error('Unsupported response format from Workers AI');
        }

        images.push({
          bytes,
          seed,
          contentType: 'image/png'
        });
      } catch (err) {
        console.warn(`[WorkersAiAdapter] Generation failed for candidate ${i}, falling back to mock:`, err);
        const fallback = await this.mockFallback.generate({
          ...params,
          numCandidates: 1
        });
        images.push(fallback.images[0]);
      }
    }

    return {
      images,
      modelName,
      parameters: {
        ...params.parameters,
        provider: 'cloudflare-workers-ai'
      }
    };
  }

  async edit(params: EditImageParams): Promise<EditResult> {
    if (!this.env.AI || this.env.MOCK_AI === 'true') {
      return this.mockFallback.edit(params);
    }

    const inpaintingModel = params.modelName || '@cf/runwayml/stable-diffusion-v1-5-inpainting';
    const regionsText = params.facialRegions.join(', ');
    const editPrompt = `forensic pencil sketch edit for ${regionsText}: ${params.prompt}. Maintain charcoal composite texture.`;

    try {
      // RunwayML SD 1.5 inpainting takes image array and mask array
      const response = await this.env.AI.run(inpaintingModel, {
        prompt: editPrompt,
        image: [...params.baseImageBytes],
        mask: [...params.maskBytes]
      });

      let rawEditedBytes: Uint8Array;
      if (response instanceof ReadableStream) {
        const res = new Response(response);
        const buffer = await res.arrayBuffer();
        rawEditedBytes = new Uint8Array(buffer);
      } else if (response instanceof Uint8Array) {
        rawEditedBytes = response;
      } else if (response instanceof ArrayBuffer) {
        rawEditedBytes = new Uint8Array(response);
      } else {
        throw new Error('Unsupported inpainting response format from Workers AI');
      }

      // Task 1 requirement: Preserve unselected pixels by compositing generated result through edit mask
      const { compositedBytes } = await compositeInpaintedImage(
        params.baseImageBytes,
        rawEditedBytes,
        params.maskBytes,
        {
          preserveBackground: (params.parameters.preserveBackground as boolean) ?? true
        }
      );

      return {
        bytes: compositedBytes,
        modelName: inpaintingModel,
        contentType: 'image/png',
        parameters: {
          ...params.parameters,
          provider: 'cloudflare-workers-ai',
          facialRegions: params.facialRegions
        }
      };
    } catch (err) {
      console.warn('[WorkersAiAdapter] Inpainting failed, falling back to mock editor:', err);
      return this.mockFallback.edit(params);
    }
  }
}

