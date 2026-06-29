'use server'

import { generateCards, isValidPgn } from '@/lib/chess/pgn'
import { createClient } from '@/lib/supabase/server'
import { revalidatePath } from 'next/cache'
import { z } from 'zod'

const schema = z.object({ title: z.string().min(1) })

export async function createDrill(formData: FormData) {
  const { title } = schema.parse({ title: formData.get('title') })
  const pgn = (formData.get('pgn') ?? '').toString().trim()
  const orientation = ((formData.get('orientation') ?? 'white').toString()) as 'white' | 'black'
  if (!pgn) throw new Error('PGN trống')
  if (!isValidPgn(pgn)) throw new Error('PGN không hợp lệ')

  const supabase = await createClient()
  const { data: drill, error } = await supabase
    .from('vt_drill_sets')
    .insert({ title, pgn, orientation })
    .select('id')
    .single()
  if (error) throw new Error(error.message)

  const cards = generateCards(pgn, orientation).map((c) => ({
    drill_set_id: drill.id,
    fen: c.fen,
    expected_move: c.expectedMove
  }))
  if (cards.length > 0) await supabase.from('vt_srs_cards').insert(cards)

  revalidatePath('/admin/drills')
}

export async function deleteDrill(id: string) {
  const supabase = await createClient()
  const { error } = await supabase.from('vt_drill_sets').delete().eq('id', id)
  if (error) throw new Error(error.message)
  revalidatePath('/admin/drills')
}
