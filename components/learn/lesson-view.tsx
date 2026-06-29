'use client'

import { ChessBoardViewer } from '@/components/chess/chess-board-viewer'
import { PgnTrainer } from '@/components/chess/pgn-trainer'
import { Button } from '@/components/ui/button'
import { VideoPlayer } from '@/components/video-player'
import type { VideoProvider } from '@/lib/providers/embed'
import type { DrillSet, LessonChapter } from '@/lib/queries/learning'
import { useVideoBoardSync } from '@/lib/video/use-video-board-sync'
import { Link2, Link2Off } from 'lucide-react'
import { useMemo, useState } from 'react'

type LessonViewProps = {
  title: string
  description: string | null
  player: {
    provider: VideoProvider
    sourceId: string | null
    embedUrl: string | null
    playbackUrl: string | null
    sourceUrl: string | null
    iframe: boolean
  } | null
  chapters: LessonChapter[]
  drills: DrillSet[]
}

function fmt(seconds: number | null) {
  if (seconds == null) return null
  const m = Math.floor(seconds / 60)
  const s = seconds % 60
  return `${m}:${s < 10 ? '0' : ''}${s}`
}

export function LessonView({ title, description, player, chapters, drills }: LessonViewProps) {
  const [tab, setTab] = useState<'view' | 'practice'>('view')
  const [drillIdx, setDrillIdx] = useState(0)

  // Đồng bộ video ↔ bàn cờ. Chỉ cần videoTimestamp + moveCues của từng chương.
  const syncChapters = useMemo(
    () => chapters.map((c) => ({ videoTimestamp: c.videoTimestamp, moveCues: c.moveCues })),
    [chapters]
  )
  const sync = useVideoBoardSync(syncChapters)

  const chapter = chapters[sync.chapterIdx]
  const drill = drills[drillIdx]
  const practicePgn = drill?.pgn ?? chapter?.pgn ?? ''
  const practiceOrientation = drill?.orientation ?? 'white'

  // Hiện nút bật/tắt "bám video" khi player điều khiển được và có mốc để bám.
  const showFollowToggle = !!player && sync.controllable && sync.hasCues

  return (
    <div className='grid grid-cols-1 gap-6 lg:grid-cols-2'>
      {/* Cột trái: video + chương */}
      <div className='flex flex-col gap-3'>
        {player && (
          <VideoPlayer
            title={title}
            provider={player.provider}
            sourceId={player.sourceId}
            embedUrl={player.embedUrl}
            playbackUrl={player.playbackUrl}
            sourceUrl={player.sourceUrl}
            iframe={player.iframe}
            onReady={sync.onReady}
            onTimeUpdate={sync.onTimeUpdate}
          />
        )}
        <h1 className='text-lg font-bold'>{title}</h1>
        {description && <p className='text-secondary-foreground text-sm whitespace-pre-wrap'>{description}</p>}

        {chapters.length > 1 && (
          <div className='flex flex-col gap-1'>
            <h2 className='text-sm font-bold'>Chương</h2>
            {chapters.map((c, i) => (
              <button
                key={c.id}
                onClick={() => {
                  sync.handleChapterSelect(i)
                  setTab('view')
                }}
                className={`flex items-center justify-between rounded-md px-3 py-2 text-left text-sm ${
                  i === sync.chapterIdx ? 'bg-accent font-semibold' : 'hover:bg-accent/50'
                }`}
              >
                <span>{c.title ?? `Chương ${i + 1}`}</span>
                {fmt(c.videoTimestamp) && <span className='text-secondary-foreground text-xs'>{fmt(c.videoTimestamp)}</span>}
              </button>
            ))}
          </div>
        )}
      </div>

      {/* Cột phải: bàn cờ */}
      <div className='flex flex-col gap-3'>
        <div className='flex flex-wrap items-center gap-2'>
          <Button variant={tab === 'view' ? 'default' : 'secondary'} size='sm' onClick={() => setTab('view')}>
            Xem bài
          </Button>
          <Button variant={tab === 'practice' ? 'default' : 'secondary'} size='sm' onClick={() => setTab('practice')}>
            Luyện tập
          </Button>
          {tab === 'view' && showFollowToggle && (
            <Button
              variant={sync.follow ? 'default' : 'outline'}
              size='sm'
              className='ml-auto'
              onClick={() => sync.setFollow(!sync.follow)}
              title='Tự động đưa bàn cờ theo video đang phát'
            >
              {sync.follow ? <Link2 className='mr-1 h-4 w-4' /> : <Link2Off className='mr-1 h-4 w-4' />}
              {sync.follow ? 'Đang bám video' : 'Bám video'}
            </Button>
          )}
        </div>

        {tab === 'view' ? (
          chapter ? (
            <ChessBoardViewer
              key={chapter.id}
              pgn={chapter.pgn}
              index={player ? sync.moveIndex : undefined}
              onIndexChange={player ? sync.handleBoardIndexChange : undefined}
            />
          ) : (
            <p className='text-secondary-foreground text-sm'>Bài học chưa có thế cờ.</p>
          )
        ) : (
          <div className='flex flex-col gap-3'>
            {drills.length > 1 && (
              <select
                value={drillIdx}
                onChange={(e) => setDrillIdx(Number(e.target.value))}
                className='border-border rounded-md border px-3 py-2 text-sm'
              >
                {drills.map((d, i) => (
                  <option key={d.id} value={i}>
                    {d.title}
                  </option>
                ))}
              </select>
            )}
            {practicePgn ? (
              <PgnTrainer key={`${drill?.id ?? chapter?.id}-practice`} pgn={practicePgn} orientation={practiceOrientation} />
            ) : (
              <p className='text-secondary-foreground text-sm'>Chưa có nội dung luyện tập.</p>
            )}
          </div>
        )}
      </div>
    </div>
  )
}
