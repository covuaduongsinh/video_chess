'use server'

import { isValidPgn, parsePgnTags } from '@/lib/chess/pgn'
import { createClient } from '@/lib/supabase/server'
import { revalidatePath } from 'next/cache'

export async function importPgn(formData: FormData) {
  const pgn = (formData.get('pgn') ?? '').toString().trim()
  const title = (formData.get('title') ?? '').toString().trim() || null
  if (!pgn) throw new Error('PGN trống')
  if (!isValidPgn(pgn)) throw new Error('PGN không hợp lệ')

  const tags = parsePgnTags(pgn)
  const supabase = await createClient()
  const { error } = await supabase.from('vt_pgn_games').insert({
    title,
    pgn,
    white: tags.white ?? null,
    black: tags.black ?? null,
    result: tags.result ?? null,
    eco: tags.eco ?? null,
    event: tags.event ?? null,
    site: tags.site ?? null,
    date_played: tags.date ?? null
  })
  if (error) throw new Error(error.message)
  revalidatePath('/admin/pgn')
}

export async function deletePgn(id: string) {
  const supabase = await createClient()
  const { error } = await supabase.from('vt_pgn_games').delete().eq('id', id)
  if (error) throw new Error(error.message)
  revalidatePath('/admin/pgn')
}
