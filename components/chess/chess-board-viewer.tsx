'use client'

import { Button } from '@/components/ui/button'
import { getMoveList } from '@/lib/chess/pgn'
import { ChevronFirst, ChevronLast, ChevronLeft, ChevronRight } from 'lucide-react'
import { useMemo, useState } from 'react'
import { Chessboard } from 'react-chessboard'

/** Xem ván cờ theo PGN: đi tiến/lùi, bấm vào nước để nhảy tới. */
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

  return (
    <div className='flex flex-col gap-3'>
      <div className='mx-auto w-full max-w-[520px]'>
        <Chessboard options={{ position: fen, boardOrientation: orientation, allowDragging: false, id: 'viewer' }} />
      </div>

      <div className='flex items-center justify-center gap-1'>
        <Button variant='secondary' size='icon' onClick={() => setIndex(0)} disabled={index === 0}>
          <ChevronFirst className='h-4 w-4' />
        </Button>
        <Button variant='secondary' size='icon' onClick={() => setIndex((i) => Math.max(0, i - 1))} disabled={index === 0}>
          <ChevronLeft className='h-4 w-4' />
        </Button>
        <Button
          variant='secondary'
          size='icon'
          onClick={() => setIndex((i) => Math.min(moves.length, i + 1))}
          disabled={index >= moves.length}
        >
          <ChevronRight className='h-4 w-4' />
        </Button>
        <Button variant='secondary' size='icon' onClick={() => setIndex(moves.length)} disabled={index >= moves.length}>
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
