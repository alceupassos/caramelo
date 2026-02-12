/**
 * Provably Fair RNG System
 * Uses Web Crypto API (SubtleCrypto) for browser and Edge Runtime compatibility.
 */

export interface VerificationResult {
  verified: boolean;
  result: number;
  hashedServerSeed: string;
  expectedHash: string;
}

export interface MinesGrid {
  grid: boolean[];
  minePositions: number[];
}

export interface SlotResult {
  reels: number[];
}

function bufferToHex(buffer: ArrayBuffer): string {
  return Array.from(new Uint8Array(buffer))
    .map((b) => b.toString(16).padStart(2, '0'))
    .join('');
}

export class ProvablyFairRNG {
  static generateServerSeed(): string {
    const bytes = new Uint8Array(32);
    crypto.getRandomValues(bytes);
    return bufferToHex(bytes.buffer);
  }

  static generateClientSeed(): string {
    const bytes = new Uint8Array(16);
    crypto.getRandomValues(bytes);
    return bufferToHex(bytes.buffer);
  }

  static async hashServerSeed(seed: string): Promise<string> {
    const data = new TextEncoder().encode(seed);
    const hashBuffer = await crypto.subtle.digest('SHA-256', data);
    return bufferToHex(hashBuffer);
  }

  static async generateResult(
    serverSeed: string,
    clientSeed: string,
    nonce: number,
  ): Promise<number> {
    const message = `${serverSeed}:${clientSeed}:${nonce}`;
    const data = new TextEncoder().encode(message);
    const hashBuffer = await crypto.subtle.digest('SHA-256', data);
    const hex = bufferToHex(hashBuffer);
    return parseInt(hex.substring(0, 8), 16) / 0xffffffff;
  }

  static async verify(
    serverSeed: string,
    clientSeed: string,
    nonce: number,
    hashedServerSeed: string,
  ): Promise<VerificationResult> {
    const expectedHash = await ProvablyFairRNG.hashServerSeed(serverSeed);
    const verified = expectedHash === hashedServerSeed;
    const result = await ProvablyFairRNG.generateResult(serverSeed, clientSeed, nonce);
    return { verified, result, hashedServerSeed, expectedHash };
  }
}

// Game-specific helpers

export function generateCrashPoint(hash: number): number {
  return Math.max(1, Math.floor((100 / (hash * 100 + 1)) * 100) / 100);
}

export function generateCoinflipResult(hash: number): 'heads' | 'tails' {
  return hash < 0.49 ? 'heads' : 'tails';
}

export function generateDiceResult(
  hash: number,
  target: number,
): { roll: number; win: boolean } {
  const roll = parseFloat((hash * 100).toFixed(2));
  return { roll, win: roll < target };
}

export function generateMinesGrid(
  hash: number,
  totalTiles: number,
  mineCount: number,
): MinesGrid {
  const seed = Math.floor(hash * 0xffffffff);
  const rng = lcg(seed);
  const indices = Array.from({ length: totalTiles }, (_, i) => i);
  for (let i = totalTiles - 1; i > 0; i--) {
    const j = rng() % (i + 1);
    [indices[i], indices[j]] = [indices[j], indices[i]];
  }
  const minePositions = indices.slice(0, mineCount).sort((a, b) => a - b);
  const grid = Array.from({ length: totalTiles }, () => false);
  for (const pos of minePositions) grid[pos] = true;
  return { grid, minePositions };
}

export function generateSlotResult(
  hash: number,
  reelCount: number,
  symbolCount: number,
): SlotResult {
  const seed = Math.floor(hash * 0xffffffff);
  const rng = lcg(seed);
  const reels: number[] = [];
  for (let i = 0; i < reelCount; i++) reels.push(rng() % symbolCount);
  return { reels };
}

function lcg(seed: number): () => number {
  let state = seed >>> 0;
  return () => {
    state = (state * 1664525 + 1013904223) >>> 0;
    return state;
  };
}
