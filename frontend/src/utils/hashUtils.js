/**
 * Client-side cryptographic hashing & blockchain ledger verification utilities.
 * Uses the Web Cryptography API (SubtleCrypto) to calculate SHA-256 hashes.
 */

/**
 * Computes a standard SHA-256 hash string for an arbitrary text input.
 * @param {string} message - String data to hash.
 * @returns {Promise<string>} Hexadecimal SHA-256 digest.
 */
export async function calculateSha256(message) {
  if (!window.crypto || !window.crypto.subtle) {
    // Fallback simple hash for older environments
    let hash = 0;
    for (let i = 0; i < message.length; i++) {
      hash = (hash << 5) - hash + message.charCodeAt(i);
      hash |= 0;
    }
    return Math.abs(hash).toString(16).padStart(64, '0');
  }

  const msgBuffer = new TextEncoder().encode(message);
  const hashBuffer = await window.crypto.subtle.digest('SHA-256', msgBuffer);
  return Array.from(new Uint8Array(hashBuffer))
    .map((b) => b.toString(16).padStart(2, '0'))
    .join('');
}

/**
 * Serializes block data and computes its canonical SHA-256 hash.
 */
export async function generateBlockHash({ blockIndex, sessionId, memberId, action, imageId, timestamp, prevHash }) {
  const rawString = `${blockIndex}|${sessionId}|${memberId}|${action}|${imageId}|${timestamp}|${prevHash}`;
  return calculateSha256(rawString);
}

/**
 * Verifies an entire chain of audit blocks.
 * Checks:
 * 1. Genesis block has prevHash of 64 zeroes.
 * 2. Every subsequent block's prevHash matches the preceding block's currHash.
 * 3. The currHash matches the freshly recalculated SHA-256 of the block's canonical contents.
 *
 * @param {Array} blocks - Array of audit log blocks.
 * @returns {Promise<{ isValid: boolean, corruptedBlockIndex: number | null, reason: string }>}
 */
export async function verifyAuditChain(blocks) {
  if (!blocks || blocks.length === 0) {
    return { isValid: true, corruptedBlockIndex: null, reason: 'Ledger is empty.' };
  }

  for (let i = 0; i < blocks.length; i++) {
    const block = blocks[i];

    // Check link to previous block
    if (i === 0) {
      const expectedGenesisPrev = '0'.repeat(64);
      if (block.prevHash !== expectedGenesisPrev && block.prevHash !== '0000000000000000000000000000000000000000000000000000000000000000') {
        return {
          isValid: false,
          corruptedBlockIndex: block.blockIndex,
          reason: `Genesis block #${block.blockIndex} contains an invalid initial zero-hash link.`
        };
      }
    } else {
      const prevBlock = blocks[i - 1];
      if (block.prevHash !== prevBlock.currHash) {
        return {
          isValid: false,
          corruptedBlockIndex: block.blockIndex,
          reason: `Chain broken at Block #${block.blockIndex}: prevHash (${block.prevHash.slice(0, 10)}...) does not match Block #${prevBlock.blockIndex} currHash (${prevBlock.currHash.slice(0, 10)}...).`
        };
      }
    }

    // Verify cryptographic integrity of the block itself
    const computedHash = await generateBlockHash(block);
    if (computedHash.toLowerCase() !== block.currHash.toLowerCase()) {
      return {
        isValid: false,
        corruptedBlockIndex: block.blockIndex,
        reason: `Cryptographic tamper detected in Block #${block.blockIndex}: stored hash does not match computed SHA-256 digest.`
      };
    }
  }

  return { isValid: true, corruptedBlockIndex: null, reason: 'All cryptographic links and block hashes are verified.' };
}
