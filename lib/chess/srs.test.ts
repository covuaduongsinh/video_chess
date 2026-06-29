import { describe, expect, it } from 'vitest'
import { sm2, type SrsState } from './srs'

const fresh: SrsState = { repetitions: 0, easeFactor: 2.5, intervalDays: 0 }

describe('sm2 (SuperMemo-2)', () => {
  it('thẻ mới, nhớ tốt (quality 5): lần đầu interval = 1 ngày, repetitions = 1', () => {
    const r = sm2(fresh, 5)
    expect(r.repetitions).toBe(1)
    expect(r.intervalDays).toBe(1)
    expect(r.easeFactor).toBeCloseTo(2.6, 5)
  })

  it('lần 2 (repetitions = 1) nhớ được: interval = 6 ngày', () => {
    const r = sm2({ repetitions: 1, easeFactor: 2.5, intervalDays: 1 }, 4)
    expect(r.repetitions).toBe(2)
    expect(r.intervalDays).toBe(6)
    // quality 4 không đổi easeFactor
    expect(r.easeFactor).toBeCloseTo(2.5, 5)
  })

  it('lần 3 trở đi: interval = round(interval * ease)', () => {
    const r = sm2({ repetitions: 2, easeFactor: 2.5, intervalDays: 6 }, 5)
    expect(r.repetitions).toBe(3)
    expect(r.intervalDays).toBe(15)
    expect(r.easeFactor).toBeCloseTo(2.6, 5)
  })

  it('quên (quality < 3): reset repetitions = 0, interval = 1', () => {
    const r = sm2({ repetitions: 5, easeFactor: 2.5, intervalDays: 30 }, 1)
    expect(r.repetitions).toBe(0)
    expect(r.intervalDays).toBe(1)
    expect(r.easeFactor).toBeLessThan(2.5)
  })

  it('easeFactor không bao giờ thấp hơn 1.3', () => {
    const r = sm2({ repetitions: 0, easeFactor: 1.3, intervalDays: 0 }, 0)
    expect(r.easeFactor).toBe(1.3)
  })

  it('dueAt là chuỗi ISO hợp lệ trong tương lai', () => {
    const r = sm2(fresh, 5)
    const due = new Date(r.dueAt).getTime()
    expect(Number.isNaN(due)).toBe(false)
    expect(due).toBeGreaterThan(Date.now() - 1000)
  })
})
