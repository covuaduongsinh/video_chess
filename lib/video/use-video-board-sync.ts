'use client'

import type { MoveCue, PlayerController } from '@/lib/video/player'
import { useCallback, useMemo, useRef, useState } from 'react'

export type { MoveCue }

export type SyncChapter = {
  videoTimestamp: number | null
  moveCues?: MoveCue[] | null
}

type Cue = { chapterIdx: number; idx: number; t: number }

/**
 * Đồng bộ 2 chiều giữa video và bàn cờ, dùng chung cho trang học và Sync Studio.
 *
 * - Video → bàn cờ (khi `follow`): mỗi lần thời gian đổi, nhảy bàn cờ tới cue mới nhất có t ≤ thời gian.
 * - Bàn cờ → video: bấm một nước có mốc → tua video tới đó (và bật lại `follow`);
 *   bấm một nước không có mốc → tạm tắt `follow` (chế độ tự khám phá).
 */
export function useVideoBoardSync(chapters: SyncChapter[]) {
  const controllerRef = useRef<PlayerController | null>(null)
  const [controllable, setControllable] = useState(false)
  const [chapterIdx, setChapterIdx] = useState(0)
  const [moveIndex, setMoveIndex] = useState(0)
  const [follow, setFollow] = useState(true)

  // Gộp mốc của mọi chương thành danh sách cue toàn cục, sắp theo thời gian.
  const cues = useMemo<Cue[]>(() => {
    const list: Cue[] = []
    chapters.forEach((c, ci) => {
      if (c.videoTimestamp != null) list.push({ chapterIdx: ci, idx: 0, t: c.videoTimestamp })
      for (const cue of c.moveCues ?? []) list.push({ chapterIdx: ci, idx: cue.idx, t: cue.t })
    })
    return list.sort((a, b) => a.t - b.t)
  }, [chapters])

  const onReady = useCallback((c: PlayerController) => {
    controllerRef.current = c
    setControllable(c.isControllable)
  }, [])

  // Video → bàn cờ: tìm cue mới nhất có t ≤ thời gian hiện tại.
  const onTimeUpdate = useCallback(
    (t: number) => {
      if (!follow || cues.length === 0) return
      let best: Cue | null = null
      for (const cue of cues) {
        if (cue.t <= t) best = cue
        else break
      }
      if (best) {
        const target = best
        setChapterIdx((prev) => (prev === target.chapterIdx ? prev : target.chapterIdx))
        setMoveIndex((prev) => (prev === target.idx ? prev : target.idx))
      }
    },
    [follow, cues]
  )

  // Bàn cờ → video: bấm một nước trong chương đang xem.
  const handleBoardIndexChange = useCallback(
    (newIdx: number) => {
      setMoveIndex(newIdx)
      const ctrl = controllerRef.current
      const cue = cues.find((q) => q.chapterIdx === chapterIdx && q.idx === newIdx)
      if (cue && ctrl?.isControllable) {
        ctrl.seek(cue.t)
        setFollow(true)
      } else {
        // Nước không có mốc → người dùng đang tự khám phá, tạm dừng bám video.
        setFollow(false)
      }
    },
    [cues, chapterIdx]
  )

  // Chọn chương: tua video tới mốc đầu chương (nếu có) và bật lại bám video.
  const handleChapterSelect = useCallback(
    (ci: number) => {
      setChapterIdx(ci)
      setMoveIndex(0)
      const ctrl = controllerRef.current
      const ts = chapters[ci]?.videoTimestamp
      if (ts != null && ctrl?.isControllable) {
        ctrl.seek(ts)
        setFollow(true)
      }
    },
    [chapters]
  )

  return {
    chapterIdx,
    moveIndex,
    follow,
    setFollow,
    controllable,
    hasCues: cues.length > 0,
    onReady,
    onTimeUpdate,
    handleBoardIndexChange,
    handleChapterSelect
  }
}
