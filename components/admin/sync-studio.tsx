'use client'

import { saveChapterCues } from '@/app/admin/(dashboard)/lessons/actions'
import { ChessBoardViewer } from '@/components/chess/chess-board-viewer'
import { Button } from '@/components/ui/button'
import { VideoPlayer } from '@/components/video-player'
import { getMoveList } from '@/lib/chess/pgn'
import type { VideoProvider } from '@/lib/providers/embed'
import type { MoveCue, PlayerController } from '@/lib/video/player'
import { useMemo, useRef, useState } from 'react'

type PlayerConfig = {
  provider: VideoProvider
  sourceId: string | null
  embedUrl: string | null
  playbackUrl: string | null
  sourceUrl: string | null
  iframe: boolean
}

function fmt(t: number) {
  const m = Math.floor(t / 60)
  const s = Math.floor(t % 60)
  return `${m}:${s < 10 ? '0' : ''}${s}`
}

/**
 * Studio gán mốc đồng bộ: admin phát video, đưa bàn cờ tới nước cần đánh dấu rồi
 * bấm "Gán mốc tại đây" để ghi { idx, t }. Có chế độ "Xem trước" chạy thử karaoke.
 */
export function SyncStudio({
  chapterId,
  lessonId,
  pgn,
  initialCues,
  player,
  title
}: {
  chapterId: string
  lessonId: string
  pgn: string
  initialCues: MoveCue[]
  player: PlayerConfig | null
  title: string
}) {
  const { moves } = useMemo(() => getMoveList(pgn), [pgn])
  const [cues, setCues] = useState<MoveCue[]>(() => [...initialCues].sort((a, b) => a.idx - b.idx))
  const [boardIndex, setBoardIndex] = useState(0)
  const [currentTime, setCurrentTime] = useState(0)
  const [follow, setFollow] = useState(false)
  const [controllable, setControllable] = useState(false)
  const [status, setStatus] = useState<'idle' | 'saving' | 'saved' | 'error'>('idle')
  const controllerRef = useRef<PlayerController | null>(null)

  const cuesByTime = useMemo(() => [...cues].sort((a, b) => a.t - b.t), [cues])

  function onReady(c: PlayerController) {
    controllerRef.current = c
    setControllable(c.isControllable)
  }

  function onTimeUpdate(t: number) {
    setCurrentTime(t)
    if (!follow) return
    let best: MoveCue | null = null
    for (const c of cuesByTime) {
      if (c.t <= t) best = c
      else break
    }
    if (best) setBoardIndex(best.idx)
  }

  function tagHere() {
    const t = controllerRef.current?.getCurrentTime() ?? currentTime
    const rounded = Math.round(t * 10) / 10
    setCues((prev) => {
      const map = new Map(prev.map((c) => [c.idx, c.t]))
      map.set(boardIndex, rounded)
      return [...map.entries()].map(([idx, tt]) => ({ idx, t: tt })).sort((a, b) => a.idx - b.idx)
    })
    setStatus('idle')
    setBoardIndex((i) => Math.min(moves.length, i + 1)) // tiện tay sang nước kế
  }

  function removeCue(idx: number) {
    setCues((prev) => prev.filter((c) => c.idx !== idx))
    setStatus('idle')
  }

  async function save() {
    setStatus('saving')
    try {
      await saveChapterCues(chapterId, lessonId, cues)
      setStatus('saved')
    } catch {
      setStatus('error')
    }
  }

  function labelForIdx(idx: number) {
    if (idx === 0) return 'Thế ban đầu'
    const m = moves[idx - 1]
    const no = Math.floor((idx - 1) / 2) + 1
    const dots = (idx - 1) % 2 === 0 ? '.' : '...'
    return m ? `${no}${dots} ${m.san}` : `Nước ${idx}`
  }

  return (
    <div className='grid grid-cols-1 gap-6 lg:grid-cols-2'>
      {/* Cột trái: video + bảng điều khiển mốc */}
      <div className='flex flex-col gap-3'>
        {player ? (
          <VideoPlayer
            title={title}
            provider={player.provider}
            sourceId={player.sourceId}
            embedUrl={player.embedUrl}
            playbackUrl={player.playbackUrl}
            sourceUrl={player.sourceUrl}
            iframe={player.iframe}
            onReady={onReady}
            onTimeUpdate={onTimeUpdate}
          />
        ) : (
          <div className='bg-secondary text-secondary-foreground flex aspect-video w-full items-center justify-center rounded-lg text-sm'>
            Bài học chưa gắn video — hãy gắn video cho bài học trước.
          </div>
        )}

        {player && !controllable && (
          <p className='rounded-md bg-yellow-500/10 p-2 text-sm text-yellow-700'>
            Nguồn video này không cho tua/đọc thời gian bằng mã (Google Drive/OneDrive). Dùng YouTube hoặc Bunny/Cloudflare
            để gán mốc.
          </p>
        )}

        <div className='text-sm'>
          Thời gian video: <b>{fmt(currentTime)}</b> • Bàn cờ đang ở: <b>{labelForIdx(boardIndex)}</b>
        </div>

        <div className='flex flex-wrap gap-2'>
          <Button onClick={tagHere} disabled={!controllable}>
            ⏱ Gán mốc tại đây
          </Button>
          <Button variant={follow ? 'default' : 'outline'} onClick={() => setFollow((f) => !f)} disabled={!controllable}>
            {follow ? '■ Dừng xem trước' : '▶ Xem trước (bám video)'}
          </Button>
        </div>

        <div className='border-border rounded-md border p-2'>
          <div className='mb-2 flex items-center justify-between'>
            <h2 className='text-sm font-bold'>Mốc đã gán ({cues.length})</h2>
            <Button size='sm' onClick={save} disabled={status === 'saving' || cues.length === 0}>
              {status === 'saving' ? 'Đang lưu…' : status === 'saved' ? '✓ Đã lưu' : 'Lưu mốc'}
            </Button>
          </div>
          {cues.length === 0 ? (
            <p className='text-muted-foreground text-sm'>
              Chưa có mốc. Phát video tới đoạn giảng một nước, đưa bàn cờ tới nước đó rồi bấm “Gán mốc tại đây”.
            </p>
          ) : (
            <ul className='max-h-48 space-y-1 overflow-y-auto text-sm'>
              {cues.map((c) => (
                <li key={c.idx} className='flex items-center justify-between gap-2'>
                  <button
                    className='hover:underline'
                    onClick={() => {
                      setBoardIndex(c.idx)
                      controllerRef.current?.seek(c.t)
                    }}
                  >
                    {labelForIdx(c.idx)} → {fmt(c.t)}
                  </button>
                  <button className='text-destructive px-1' onClick={() => removeCue(c.idx)} aria-label='Xoá mốc'>
                    ×
                  </button>
                </li>
              ))}
            </ul>
          )}
          {status === 'error' && <p className='text-destructive mt-1 text-sm'>Lưu thất bại. Thử lại.</p>}
        </div>
      </div>

      {/* Cột phải: bàn cờ */}
      <div className='flex flex-col gap-3'>
        <ChessBoardViewer
          pgn={pgn}
          index={boardIndex}
          onIndexChange={(i) => {
            setFollow(false)
            setBoardIndex(i)
          }}
        />
        <p className='text-muted-foreground text-sm'>
          Đưa bàn cờ tới nước cần đánh dấu (bấm nước hoặc ◀ ▶), tua video tới đúng đoạn giảng nước đó, rồi bấm “Gán mốc tại
          đây”. Sau khi gán, bàn cờ tự sang nước kế cho tiện.
        </p>
      </div>
    </div>
  )
}
