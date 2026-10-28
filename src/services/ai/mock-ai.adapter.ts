import { AiAdapter, EditImageParams, EditResult, GenerateCandidateParams, GenerateResult } from './adapter.interface';
import { compositeInpaintedImage } from './compositor';

/**
 * Creates a valid, standalone uncompressed-deflate PNG image in pure TypeScript
 * Width x Height RGBA image with forensic sketch aesthetic.
 */
export function createForensicSketchPng(
  width: number,
  height: number,
  title: string,
  variantIndex: number,
  edits: string[] = []
): Uint8Array {
  // Generate RGBA buffer
  const scanlineLength = 1 + width * 4; // 1 filter byte per row + RGBA
  const rawData = new Uint8Array(scanlineLength * height);

  // Forensic sketch tones: charcoal/pencil gray (30-60) on parchment background (220-245)
  for (let y = 0; y < height; y++) {
    const rowOffset = y * scanlineLength;
    rawData[rowOffset] = 0; // Filter type None

    for (let x = 0; x < width; x++) {
      const pxOffset = rowOffset + 1 + x * 4;

      // Base paper texture with slight noise
      const noise = ((x * 13 + y * 37 + variantIndex * 53) % 25) - 12;
      let r = Math.min(255, Math.max(0, 238 + noise));
      let g = Math.min(255, Math.max(0, 235 + noise));
      let b = Math.min(255, Math.max(0, 228 + noise));

      // Forensic face oval outline: center (width/2, height/2 - 10)
      const cx = width / 2;
      const cy = height / 2 - 10;
      const dx = (x - cx) / (width * 0.28);
      const dy = (y - cy) / (height * 0.36);
      const dist = dx * dx + dy * dy;

      // Jawline / Face contour lines
      if (dist >= 0.95 && dist <= 1.05) {
        // Outline sketch stroke
        r = 50; g = 50; b = 55;
      } else if (dist < 0.95) {
        // Inside face: eyes, nose, mouth features
        // Eye level: y around cy - 25
        const eyeY = cy - height * 0.08;
        const leftEyeX = cx - width * 0.12;
        const rightEyeX = cx + width * 0.12;

        const dLeftEye = Math.hypot(x - leftEyeX, (y - eyeY) * 1.8);
        const dRightEye = Math.hypot(x - rightEyeX, (y - eyeY) * 1.8);

        // Eyes
        if (dLeftEye < width * 0.04 || dRightEye < width * 0.04) {
          r = 35; g = 35; b = 40;
        }

        // Nose line: cy to cy + 20
        if (Math.abs(x - cx) < 3 && y >= cy - 5 && y <= cy + height * 0.09) {
          r = 60; g = 60; b = 65;
        }

        // Mouth: cy + 40
        const mouthY = cy + height * 0.15;
        const dMouth = Math.hypot(x - cx, (y - mouthY) * 3);
        if (dMouth < width * 0.09 && Math.abs(y - mouthY) < 4) {
          r = 45; g = 45; b = 50;
        }

        // Forehead / Hair hairline
        if (dy < -0.4) {
          const hairNoise = ((x * 7 + variantIndex * 31) % 15);
          if (dy < -0.6 + hairNoise * 0.01) {
            r = 30; g = 30; b = 35;
          }
        }

        // Highlight edited regions if present
        if (edits.length > 0) {
          if (edits.includes('jawline') && dy > 0.5) {
            r = 90; g = 40; b = 40; // forensic red chalk mark
          } else if (edits.includes('eyes') && Math.abs(y - eyeY) < 15) {
            r = 40; g = 70; b = 110; // forensic blue chalk mark
          }
        }
      }

      // Candidate label border corner
      if (x < 60 && y < 24) {
        r = 210; g = 210; b = 210;
      }

      rawData[pxOffset] = r;
      rawData[pxOffset + 1] = g;
      rawData[pxOffset + 2] = b;
      rawData[pxOffset + 3] = 255; // Alpha
    }
  }

  return encodePng(width, height, rawData);
}

/**
 * Pure TypeScript PNG chunk builder with uncompressed zlib stream
 */
function encodePng(width: number, height: number, rawRgbaWithFilters: Uint8Array): Uint8Array {
  // CRC32 calculation table
  const crcTable: number[] = [];
  for (let n = 0; n < 256; n++) {
    let c = n;
    for (let k = 0; k < 8; k++) {
      if (c & 1) c = 0xedb88320 ^ (c >>> 1);
      else c = c >>> 1;
    }
    crcTable[n] = c;
  }

  function crc32(buf: Uint8Array, offset: number, length: number): number {
    let c = 0xffffffff;
    for (let i = 0; i < length; i++) {
      c = crcTable[(c ^ buf[offset + i]) & 0xff] ^ (c >>> 8);
    }
    return (c ^ 0xffffffff) >>> 0;
  }

  // 1. Deflate stream without compression (Type 0 / uncompressed blocks)
  const BLOCK_SIZE = 65535;
  const numBlocks = Math.ceil(rawRgbaWithFilters.length / BLOCK_SIZE);
  const zlibHeaderSize = 2; // 0x78, 0x01
  const zlibTrailerSize = 4; // Adler-32
  const idatDataSize = zlibHeaderSize + rawRgbaWithFilters.length + numBlocks * 5 + zlibTrailerSize;
  const idatPayload = new Uint8Array(idatDataSize);

  idatPayload[0] = 0x78; // CMF (Deflate, 32K window)
  idatPayload[1] = 0x01; // FLG (check bits)

  let inPos = 0;
  let outPos = 2;

  for (let b = 0; b < numBlocks; b++) {
    const isLast = b === numBlocks - 1;
    const len = Math.min(BLOCK_SIZE, rawRgbaWithFilters.length - inPos);
    const nlen = len ^ 0xffff;

    idatPayload[outPos++] = isLast ? 0x01 : 0x00; // BFINAL, BTYPE=00
    idatPayload[outPos++] = len & 0xff;
    idatPayload[outPos++] = (len >> 8) & 0xff;
    idatPayload[outPos++] = nlen & 0xff;
    idatPayload[outPos++] = (nlen >> 8) & 0xff;

    idatPayload.set(rawRgbaWithFilters.subarray(inPos, inPos + len), outPos);
    inPos += len;
    outPos += len;
  }

  // Calculate Adler-32 of rawRgbaWithFilters
  let s1 = 1;
  let s2 = 0;
  for (let i = 0; i < rawRgbaWithFilters.length; i++) {
    s1 = (s1 + rawRgbaWithFilters[i]) % 65521;
    s2 = (s2 + s1) % 65521;
  }
  const adler = ((s2 << 16) | s1) >>> 0;
  idatPayload[outPos++] = (adler >> 24) & 0xff;
  idatPayload[outPos++] = (adler >> 16) & 0xff;
  idatPayload[outPos++] = (adler >> 8) & 0xff;
  idatPayload[outPos++] = adler & 0xff;

  // 2. Assemble PNG Chunks: Signature + IHDR + IDAT + IEND
  const signature = new Uint8Array([137, 80, 78, 71, 13, 10, 26, 10]);

  // IHDR: 13 bytes data
  const ihdr = new Uint8Array(4 + 4 + 13 + 4);
  const ihdrView = new DataView(ihdr.buffer);
  ihdrView.setUint32(0, 13); // length
  ihdr.set([73, 72, 68, 82], 4); // "IHDR"
  ihdrView.setUint32(8, width);
  ihdrView.setUint32(12, height);
  ihdr[16] = 8; // bit depth
  ihdr[17] = 6; // color type RGBA
  ihdr[18] = 0; // compression
  ihdr[19] = 0; // filter
  ihdr[20] = 0; // interlace
  ihdrView.setUint32(21, crc32(ihdr, 4, 17));

  // IDAT chunk
  const idat = new Uint8Array(4 + 4 + outPos + 4);
  const idatView = new DataView(idat.buffer);
  idatView.setUint32(0, outPos);
  idat.set([73, 68, 65, 84], 4); // "IDAT"
  idat.set(idatPayload.subarray(0, outPos), 8);
  idatView.setUint32(8 + outPos, crc32(idat, 4, 4 + outPos));

  // IEND chunk
  const iend = new Uint8Array([0, 0, 0, 0, 73, 69, 78, 68, 174, 66, 96, 130]);

  // Combine all parts
  const totalLength = signature.length + ihdr.length + idat.length + iend.length;
  const png = new Uint8Array(totalLength);
  let p = 0;
  png.set(signature, p); p += signature.length;
  png.set(ihdr, p); p += ihdr.length;
  png.set(idat, p); p += idat.length;
  png.set(iend, p);

  return png;
}

export class MockAiAdapter implements AiAdapter {
  async generate(params: GenerateCandidateParams): Promise<GenerateResult> {
    const images: GenerateResult['images'] = [];
    const width = 256;
    const height = 256;

    for (let i = 0; i < params.numCandidates; i++) {
      const seed = (params.parameters.seed as number) || Math.floor(Math.random() * 1000000) + i;
      const bytes = createForensicSketchPng(width, height, params.prompt, i);
      images.push({
        bytes,
        seed,
        contentType: 'image/png'
      });
    }

    return {
      images,
      modelName: params.modelName || 'mock-forensic-pencil-v1',
      parameters: {
        ...params.parameters,
        mockGenerated: true,
        candidateCount: params.numCandidates
      }
    };
  }

  async edit(params: EditImageParams): Promise<EditResult> {
    const width = 256;
    const height = 256;

    // Generate modified sketch reflecting the facial region edits
    const inpaintedBytes = createForensicSketchPng(
      width,
      height,
      params.prompt,
      99,
      params.facialRegions
    );

    // Composite through edit mask to preserve unselected pixels
    const { compositedBytes } = await compositeInpaintedImage(
      params.baseImageBytes,
      inpaintedBytes,
      params.maskBytes,
      {
        preserveBackground: (params.parameters.preserveBackground as boolean) ?? true
      }
    );

    return {
      bytes: compositedBytes,
      modelName: params.modelName || 'mock-forensic-inpainting-v1',
      contentType: 'image/png',
      parameters: {
        ...params.parameters,
        mockEdited: true,
        facialRegions: params.facialRegions,
        previousRevisionsConsidered: params.revisionContext?.previousEdits?.length || 0
      }
    };
  }
}

