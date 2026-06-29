'use client'

import { deleteTournament } from './actions'

export function DeleteTournamentButton({ id }: { id: string }) {
  return (
    <button
      onClick={async () => {
        if (!confirm('Xoá giải đấu này?')) return
        await deleteTournament(id)
      }}
      className='text-destructive text-sm hover:underline'
    >
      Xoá
    </button>
  )
}
