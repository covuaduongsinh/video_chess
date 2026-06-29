'use client'

import { Button } from '@/components/ui/button'
import { getMoveList } from '@/lib/chess/pgn'
import { ChevronFirst, ChevronLast, ChevronLeft, ChevronRight } from 'lucide-react'
import { useCallback, useEffect, useMemo, useState } from 'react'
import { Chessboard } from 'react-chessboard'

/** Xem ván cờ theo PGN: đi tiến/lùi, bấm vào nước để nhảy tới. Hỗ trợ phím ←→Home End. */
export function ChessBoardViewer({
  pgn,
  orientation = 'white'
}: {
  pgn: string
  orientation?: 'white' | 'black'
}) {
  const { startFen, moves } = useMemo(() => getMoveList(pgn), [pgn])
  // index = 0 -> thế ban đầu; i -> sau nước thứ i
  const [index, setIndex] = useState(0)
  const fen = index === 0 ? startFen : moves[index - 1].fen

  const goFirst = useCallback(() => setIndex(0), [])
  const goPrev = useCallback(() => setIndex((i) => Math.max(0, i - 1)), [])
  const goNext = useCallback(() => setIndex((i) => Math.min(moves.length, i + 1)), [moves.length])
  const goLast = useCallback(() => setIndex(moves.length), [moves.length])

  // Điều hướng bàn phím: ←→ Home End
  useEffect(() => {
    function onKey(e: KeyboardEvent) {
      if (e.target instanceof HTMLInputElement || e.target instanceof HTMLTextAreaElement) return
      if (e.key === 'ArrowLeft') { e.preventDefault(); goPrev() }
      else if (e.key === 'ArrowRight') { e.preventDefault(); goNext() }
      else if (e.key === 'Home') { e.preventDefault(); goFirst() }
      else if (e.key === 'End') { e.preventDefault(); goLast() }
    }
    window.addEventListener('keydown', onKey)
    return () => window.removeEventListener('keydown', onKey)
  }, [goFirst, goPrev, goNext, goLast])

  return (
    <div className='flex flex-col gap-3' role='region' aria-label='Bàn cờ'>
      <div className='mx-auto w-full max-w-[520px]'>
        <Chessboard options={{ position: fen, boardOrientation: orientation, allowDragging: false, id: 'viewer' }} />
      </div>

      <div className='flex items-center justify-center gap-1'>
        <Button variant='secondary' size='icon' onClick={goFirst} disabled={index === 0} aria-label='Nước đầu tiên'>
          <ChevronFirst className='h-4 w-4' />
        </Button>
        <Button variant='secondary' size='icon' onClick={goPrev} disabled={index === 0} aria-label='Nước trước'>
          <ChevronLeft className='h-4 w-4' />
        </Button>
        <Button
          variant='secondary'
          size='icon'
          onClick={goNext}
          disabled={index >= moves.length}
          aria-label='Nước tiếp theo'
        >
          <ChevronRight className='h-4 w-4' />
        </Button>
        <Button variant='secondary' size='icon' onClick={goLast} disabled={index >= moves.length} aria-label='Nước cuối'>
          <ChevronLast className='h-4 w-4' />
        </Button>
      </div>

      {moves.length > 0 && (
        <div className='border-border max-h-40 overflow-y-auto rounded-md border p-2 text-sm leading-7'>
          {moves.map((m, i) => {
            const moveNo = Math.floor(i / 2) + 1
            return (
              <span key={i}>
                {i % 2 === 0 && <span className='text-secondary-foreground mr-1'>{moveNo}.</span>}
                <button
                  onClick={() => setIndex(i + 1)}
                  className={`mr-2 rounded px-1 ${index === i + 1 ? 'bg-accent font-bold' : 'hover:bg-accent/50'}`}
                >
                  {m.san}
                </button>
              </span>
            )
          })}
        </div>
      )}
    </div>
  )
}
