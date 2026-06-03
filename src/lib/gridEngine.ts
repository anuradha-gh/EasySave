import type { GridConfig } from './types';

/**
 * Fisher-Yates (Knuth) in-place shuffle.
 * @param arr - The array to shuffle (mutated in place).
 * @returns The same array reference, now shuffled.
 */
function fisherYatesShuffle<T>(arr: T[]): T[] {
  for (let i = arr.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [arr[i], arr[j]] = [arr[j], arr[i]];
  }
  return arr;
}

/**
 * Generate an array of daily saving amounts that sum **exactly** to `targetAmount`.
 *
 * This version uses a Chunking Algorithm:
 * 1. Groups days into chunks (e.g. 4, 5, 10).
 * 2. Assigns a multiplier to each chunk to generate identical numbers (e.g. 10 tiles of 2400).
 * 3. Exact reconciliation is performed at the chunk multiplier level to ensure 
 *    the sum exactly matches without breaking the "rounded numbers" rule.
 *
 * @param config - Grid generation parameters.
 * @returns A shuffled array of length `totalDays` whose values sum to `targetAmount`.
 */
export function generateGrid(config: GridConfig): number[] {
  const { targetAmount, totalDays, minBase } = config;

  if (totalDays <= 0) {
    throw new Error('totalDays must be a positive integer.');
  }
  if (targetAmount <= 0) {
    throw new Error('targetAmount must be a positive number.');
  }
  if (targetAmount < totalDays) {
    throw new Error(
      `targetAmount (${targetAmount}) must be at least totalDays (${totalDays}) so every tile can be >= 1.`,
    );
  }

  // ── 1. Determine Nice Step ──────────────────────────────────────────────
  // This ensures the values are nicely rounded numbers (e.g. multiples of 10)
  let step = 1;
  if (targetAmount % 100 === 0) step = 10;
  else if (targetAmount % 50 === 0) step = 10;
  else if (targetAmount % 10 === 0) step = 10;
  else if (targetAmount % 5 === 0) step = 5;
  const T = targetAmount / step;

  // ── 2. Partition totalDays into chunks ──────────────────────────────────
  // We guarantee at least one chunk of size 1 so we can perfectly resolve any diff.
  let days = totalDays - 1;
  const chunks: number[] = [1];
  
  while (days > 0) {
    if (days >= 10 && Math.random() < 0.4) { chunks.push(10); days -= 10; }
    else if (days >= 5 && Math.random() < 0.5) { chunks.push(5); days -= 5; }
    else if (days >= 4 && Math.random() < 0.8) { chunks.push(4); days -= 4; }
    else if (days >= 2) { chunks.push(2); days -= 2; }
    else { chunks.push(1); days -= 1; }
  }

  fisherYatesShuffle(chunks);

  // ── 3. Distribute tiers (Low, Medium, High) ───────────────────────────
  const lowCount = Math.floor(0.3 * chunks.length);
  const highCount = Math.floor(0.2 * chunks.length);
  const medCount = chunks.length - lowCount - highCount;

  const baseM = Math.max(1, Math.round(minBase / step));
  const weights: number[] = [];
  
  for (let i = 0; i < lowCount; i++) {
    weights.push(baseM * (1 + Math.random()));
  }
  for (let i = 0; i < medCount; i++) {
    weights.push(baseM * (2 + Math.random() * 3));
  }
  for (let i = 0; i < highCount; i++) {
    weights.push(baseM * (5 + Math.random() * 10));
  }

  // ── 4. Scale weights so sum(chunks[i] * M[i]) ~ T ─────────────────────
  const rawSum = chunks.reduce((sum, size, i) => sum + size * weights[i], 0);
  const scale = T / rawSum;

  const minAllowedM = Math.max(1, Math.floor(minBase / step));
  const M: number[] = weights.map(w => Math.max(minAllowedM, Math.round(w * scale)));

  // ── 5. Correct rounding errors ────────────────────────────────────────
  let currentSum = chunks.reduce((sum, size, i) => sum + size * M[i], 0);
  let diff = T - currentSum;

  // Helper: find the largest chunk that fits within `maxSize`
  const findChunk = (maxSize: number, requiresMgtMin: boolean) => {
    let bestIdx = -1;
    let bestSize = -1;
    // We shuffle indices to pick randomly among equals
    const indices = Array.from({ length: chunks.length }, (_, i) => i);
    fisherYatesShuffle(indices);

    for (const i of indices) {
      if (chunks[i] <= maxSize && chunks[i] > bestSize) {
        if (!requiresMgtMin || M[i] > minAllowedM) {
          bestSize = chunks[i];
          bestIdx = i;
        }
      }
    }
    return bestIdx;
  };

  while (diff !== 0) {
    if (diff > 0) {
      const idx = findChunk(diff, false);
      if (idx !== -1) {
        M[idx]++;
        diff -= chunks[idx];
      } else {
        // Fallback: add to the size 1 chunk
        const idx1 = chunks.indexOf(1);
        M[idx1]++;
        diff -= 1;
      }
    } else { // diff < 0
      const idx = findChunk(-diff, true);
      if (idx !== -1) {
        M[idx]--;
        diff += chunks[idx];
      } else {
        // Fallback: subtract from ANY chunk where M > minAllowedM, 
        // increasing diff to become positive (handled in next loop)
        const idxAny = chunks.findIndex((_, i) => M[i] > minAllowedM);
        if (idxAny !== -1) {
          M[idxAny]--;
          diff += chunks[idxAny];
        } else {
          // Safety fallback: if we absolutely must subtract but all are at minimum,
          // we are forced to break the minimum rule on the size 1 chunk to guarantee exact sum.
          const idx1 = chunks.indexOf(1);
          M[idx1]--;
          diff += 1;
        }
      }
    }
  }

  // ── 6. Expand chunks into final grid ──────────────────────────────────
  const finalGrid: number[] = [];
  for (let i = 0; i < chunks.length; i++) {
    for (let j = 0; j < chunks[i]; j++) {
      finalGrid.push(M[i] * step);
    }
  }

  // ── 7. Assertion ──────────────────────────────────────────────────────
  const finalSum = finalGrid.reduce((sum, v) => sum + v, 0);
  if (finalGrid.length !== totalDays || finalSum !== targetAmount) {
    throw new Error(
      `Grid verification failed: length=${finalGrid.length} (expected ${totalDays}), sum=${finalSum} (expected ${targetAmount}).`,
    );
  }

  // Final shuffle so the chunks are distributed nicely throughout the days
  fisherYatesShuffle(finalGrid);

  // Group tiles by sorting, so that identical amounts are clustered together 
  // and the grid goes from smallest to largest values, matching the user's example format!
  finalGrid.sort((a, b) => a - b);
  
  return finalGrid;
}
