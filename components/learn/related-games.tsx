'use client'

import { ChessBoardViewer } from '@/components/chess/chess-board-viewer'
import type { RelatedGame } from '@/lib/queries/learning'
import { useState } from 'react'

function label(g: RelatedGame) {
  const players = [g.white, g.black].filter(Boolean).join(' – ')
  return players || g.title || 'Ván cờ'
}

/** "Ván cờ liên quan" của một video — bấm để mở/đóng bàn cờ tương tác ngay tại chỗ. */
export function RelatedGames({ games }: { games: RelatedGame[] }) {
  const [openId, setOpenId] = useState<string | null>(null)
  const open = games.find((g) => g.id === openId) ?? null
  if (games.length === 0) return null

  return (
    <section className='flex flex-col gap-2'>
      <h2 className='text-sm font-bold'>Ván cờ liên quan</h2>
      <div className='flex flex-col gap-1'>
        {games.map((g) => (
          <button
            key={g.id}
            onClick={() => setOpenId((cur) => (cur === g.id ? null : g.id))}
            className={`flex items-center justify-between rounded-md px-3 py-2 text-left text-sm ${
              openId === g.id ? 'bg-accent font-semibold' : 'hover:bg-accent/50'
            }`}
          >
            <span>{label(g)}</span>
            {g.eco && <span className='text-secondary-foreground text-xs'>{g.eco}</span>}
          </button>
        ))}
      </div>
      {open && (
        <div className='border-border rounded-lg border p-3'>
          {open.title && <p className='mb-2 text-sm font-semibold'>{open.title}</p>}
          <ChessBoardViewer key={open.id} pgn={open.pgn} />
        </div>
      )}
    </section>
  )
}
