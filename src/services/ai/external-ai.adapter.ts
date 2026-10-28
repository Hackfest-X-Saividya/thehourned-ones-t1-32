import { Env } from '../../types';
import { AiAdapter, EditImageParams, EditResult, GenerateCandidateParams, GenerateResult } from './adapter.interface';
import { compositeInpaintedImage } from './compositor';
import { MockAiAdapter } from './mock-ai.adapter';

export class ExternalAiAdapter implements AiAdapter {
  private mockFallback = new MockAiAdapter();

  constructor(private env: Env) {}

  async generate(params: GenerateCandidateParams): Promise<GenerateResult> {
    const apiKey = this.env.EXTERNAL_AI_API_KEY;
    const apiUrl = this.env.EXTERNAL_AI_URL || 'https://api.openai.com/v1/images/generations';

    if (!apiKey) {
      return this.mockFallback.generate(params);
    }

    try {
      const prompt = `Forensic crime scene pencil sketch, police suspect composite portrait: ${params.prompt}`;
      const response = await fetch(apiUrl, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${apiKey}`
        },
        body: JSON.stringify({
          model: params.modelName || 'dall-e-3',
          prompt,
          n: Math.min(params.numCandidates, 1), // DALL-E 3 supports 1
          size: '1024x1024',
          response_format: 'b64_json'
        })
      });

      if (!response.ok) {
        throw new Error(`External AI API returned ${response.status}: ${await response.text()}`);
      }

      const data = await response.json() as any;
      const images: GenerateResult['images'] = [];

      for (const item of data.data) {
        const b64 = item.b64_json;
        const bytes = Uint8Array.from(atob(b64), c => c.charCodeAt(0));
        images.push({
          bytes,
          contentType: 'image/png'
        });
      }

      return {
        images,
        modelName: params.modelName || 'external-dall-e',
        parameters: {
          ...params.parameters,
          provider: 'external-api'
        }
      };
    } catch (err) {
      console.warn('[ExternalAiAdapter] External generation failed, falling back:', err);
      return this.mockFallback.generate(params);
    }
  }

  async edit(params: EditImageParams): Promise<EditResult> {
    const apiKey = this.env.EXTERNAL_AI_API_KEY;
    const apiUrl = this.env.EXTERNAL_AI_URL ? `${this.env.EXTERNAL_AI_URL}/edits` : 'https://api.openai.com/v1/images/edits';

    if (!apiKey) {
      return this.mockFallback.edit(params);
    }

    try {
      const formData = new FormData();
      formData.append('image', new Blob([params.baseImageBytes], { type: 'image/png' }), 'image.png');
      formData.append('mask', new Blob([params.maskBytes], { type: 'image/png' }), 'mask.png');
      formData.append('prompt', `Forensic composite sketch edit: ${params.prompt}`);
      formData.append('model', 'dall-e-2');
      formData.append('n', '1');
      formData.append('size', '1024x1024');
      formData.append('response_format', 'b64_json');

      const response = await fetch(apiUrl, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${apiKey}`
        },
        body: formData
      });

      if (!response.ok) {
        throw new Error(`External edit API failed with status ${response.status}`);
      }

      const data = await response.json() as any;
      const b64 = data.data[0].b64_json;
      const rawBytes = Uint8Array.from(atob(b64), c => c.charCodeAt(0));

      const { compositedBytes } = await compositeInpaintedImage(
        params.baseImageBytes,
        rawBytes,
        params.maskBytes
      );

      return {
        bytes: compositedBytes,
        modelName: 'external-inpainting',
        contentType: 'image/png',
        parameters: {
          ...params.parameters,
          provider: 'external-api'
        }
      };
    } catch (err) {
      console.warn('[ExternalAiAdapter] External edit failed, falling back:', err);
      return this.mockFallback.edit(params);
    }
  }
}

