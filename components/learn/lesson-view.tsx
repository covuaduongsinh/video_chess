'use client'

import { ChessBoardViewer } from '@/components/chess/chess-board-viewer'
import { PgnTrainer } from '@/components/chess/pgn-trainer'
import { Button } from '@/components/ui/button'
import { VideoPlayer } from '@/components/video-player'
import type { DrillSet, LessonChapter } from '@/lib/queries/learning'
import { useState } from 'react'

type LessonViewProps = {
  title: string
  description: string | null
  player: { embedUrl: string | null; playbackUrl: string | null; sourceUrl: string | null; iframe: boolean } | null
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
  const [chapterIdx, setChapterIdx] = useState(0)
  const [drillIdx, setDrillIdx] = useState(0)

  const chapter = chapters[chapterIdx]
  const drill = drills[drillIdx]
  const practicePgn = drill?.pgn ?? chapter?.pgn ?? ''
  const practiceOrientation = drill?.orientation ?? 'white'

  return (
    <div className='grid grid-cols-1 gap-6 lg:grid-cols-2'>
      {/* Cột trái: video + chương */}
      <div className='flex flex-col gap-3'>
        {player && (
          <VideoPlayer
            title={title}
            embedUrl={player.embedUrl}
            playbackUrl={player.playbackUrl}
            sourceUrl={player.sourceUrl}
            iframe={player.iframe}
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
                  setChapterIdx(i)
                  setTab('view')
                }}
                className={`flex items-center justify-between rounded-md px-3 py-2 text-left text-sm ${
                  i === chapterIdx ? 'bg-accent font-semibold' : 'hover:bg-accent/50'
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
        <div className='flex gap-2'>
          <Button variant={tab === 'view' ? 'default' : 'secondary'} size='sm' onClick={() => setTab('view')}>
            Xem bài
          </Button>
          <Button variant={tab === 'practice' ? 'default' : 'secondary'} size='sm' onClick={() => setTab('practice')}>
            Luyện tập
          </Button>
        </div>

        {tab === 'view' ? (
          chapter ? (
            <ChessBoardViewer key={chapter.id} pgn={chapter.pgn} />
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
