import { Env } from '../../types';

// In-memory fallback blob store for testing & local environment
const inMemoryStorage = new Map<string, { data: Uint8Array; contentType: string }>();

export class R2StorageService {
  constructor(private env: Env) {}

  /**
   * Upload an image to R2
   */
  async uploadImage(
    caseId: string,
    imageId: string,
    data: Uint8Array | ArrayBuffer,
    contentType = 'image/png'
  ): Promise<{ r2Key: string; size: number }> {
    const r2Key = `cases/${caseId}/images/${imageId}.png`;
    const uint8 = data instanceof Uint8Array ? data : new Uint8Array(data);

    if (this.env.BUCKET) {
      try {
        await this.env.BUCKET.put(r2Key, uint8, {
          httpMetadata: { contentType },
          customMetadata: {
            caseId,
            imageId,
            uploadedAt: new Date().toISOString()
          }
        });
      } catch (err) {
        console.warn('[R2StorageService] Failed to upload to R2, saving to in-memory store:', err);
        inMemoryStorage.set(r2Key, { data: uint8, contentType });
      }
    } else {
      inMemoryStorage.set(r2Key, { data: uint8, contentType });
    }

    return {
      r2Key,
      size: uint8.byteLength
    };
  }

  /**
   * Upload an edit mask to R2
   */
  async uploadMask(
    caseId: string,
    imageId: string,
    data: Uint8Array | ArrayBuffer,
    contentType = 'image/png'
  ): Promise<{ r2MaskKey: string; size: number }> {
    const r2MaskKey = `cases/${caseId}/masks/${imageId}_mask.png`;
    const uint8 = data instanceof Uint8Array ? data : new Uint8Array(data);

    if (this.env.BUCKET) {
      try {
        await this.env.BUCKET.put(r2MaskKey, uint8, {
          httpMetadata: { contentType },
          customMetadata: {
            caseId,
            imageId,
            uploadedAt: new Date().toISOString()
          }
        });
      } catch (err) {
        console.warn('[R2StorageService] Failed to upload mask to R2, saving to memory:', err);
        inMemoryStorage.set(r2MaskKey, { data: uint8, contentType });
      }
    } else {
      inMemoryStorage.set(r2MaskKey, { data: uint8, contentType });
    }

    return {
      r2MaskKey,
      size: uint8.byteLength
    };
  }

  /**
   * Retrieve image or mask bytes from R2 (or fallback memory)
   */
  async getObject(key: string): Promise<{ data: Uint8Array; contentType: string } | null> {
    if (this.env.BUCKET) {
      try {
        const object = await this.env.BUCKET.get(key);
        if (object) {
          const arrayBuffer = await object.arrayBuffer();
          const contentType = object.httpMetadata?.contentType || 'image/png';
          return {
            data: new Uint8Array(arrayBuffer),
            contentType
          };
        }
      } catch (err) {
        console.warn('[R2StorageService] Failed to get object from R2, checking memory:', err);
      }
    }

    const inMem = inMemoryStorage.get(key);
    if (inMem) {
      return inMem;
    }

    return null;
  }

  /**
   * Helper to clear in-memory store (for unit tests)
   */
  static clearMemory() {
    inMemoryStorage.clear();
  }
}

