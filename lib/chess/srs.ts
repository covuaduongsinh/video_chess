export type SrsState = {
  repetitions: number
  easeFactor: number
  intervalDays: number
}

export type SrsResult = SrsState & { dueAt: string }

/**
 * Thuật toán SM-2 (SuperMemo 2). quality: 0..5 (>=3 là nhớ được).
 */
export function sm2(prev: SrsState, quality: number): SrsResult {
  let { repetitions, easeFactor, intervalDays } = prev

  if (quality < 3) {
    repetitions = 0
    intervalDays = 1
  } else {
    if (repetitions === 0) intervalDays = 1
    else if (repetitions === 1) intervalDays = 6
    else intervalDays = Math.round(intervalDays * easeFactor)
    repetitions += 1
  }

  easeFactor = Math.max(1.3, easeFactor + (0.1 - (5 - quality) * (0.08 + (5 - quality) * 0.02)))

  const dueAt = new Date(Date.now() + intervalDays * 86_400_000).toISOString()
  return { repetitions, easeFactor, intervalDays, dueAt }
}
