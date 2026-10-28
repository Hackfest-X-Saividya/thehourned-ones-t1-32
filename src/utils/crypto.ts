// ID and Cryptography Utilities

export function generateId(prefix: 'case' | 'img' | 'gen' | 'aud' | 'usr' | 'acc'): string {
  const random = crypto.randomUUID().replace(/-/g, '').substring(0, 16);
  return `${prefix}_${random}`;
}

export function generateRequestId(): string {
  return `req_${crypto.randomUUID().replace(/-/g, '').substring(0, 12)}`;
}

export async function computeSha256(data: ArrayBuffer | Uint8Array): Promise<string> {
  const hashBuffer = await crypto.subtle.digest('SHA-256', data);
  const hashArray = Array.from(new Uint8Array(hashBuffer));
  return hashArray.map(b => b.toString(16).padStart(2, '0')).join('');
}

export function getCurrentIsoTimestamp(): string {
  return new Date().toISOString();
}

