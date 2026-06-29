'use server'

import { generateCards, isValidPgn } from '@/lib/chess/pgn'
import { createClient } from '@/lib/supabase/server'
import { revalidatePath } from 'next/cache'
import { redirect } from 'next/navigation'
import { z } from 'zod'

const str = (v: FormDataEntryValue | null) => {
  const t = (v ?? '').toString().trim()
  return t === '' ? null : t
}
const schema = z.object({
  title: z.string().min(1),
  slug: z.string().min(1),
  difficulty: z.enum(['beginner', 'intermediate', 'advanced']),
  status: z.enum(['draft', 'published', 'hidden'])
})

export async function createLesson(formData: FormData) {
  const { title, slug, difficulty, status } = schema.parse({
    title: formData.get('title'),
    slug: formData.get('slug'),
    difficulty: formData.get('difficulty'),
    status: formData.get('status')
  })
  const description = str(formData.get('description'))
  const videoId = str(formData.get('video_id'))
  const pgn = str(formData.get('pgn'))
  const orientation = (str(formData.get('orientation')) ?? 'white') as 'white' | 'black'
  const makeDrill = formData.get('make_drill') === 'on'

  if (pgn && !isValidPgn(pgn)) throw new Error('PGN không hợp lệ')

  const supabase = await createClient()
  const { data: lesson, error } = await supabase
    .from('vt_lessons')
    .insert({ title, slug, description, video_id: videoId, difficulty, status })
    .select('id')
    .single()
  if (error) throw new Error(error.message)

  if (pgn) {
    await supabase
      .from('vt_lesson_chapters')
      .insert({ lesson_id: lesson.id, title: 'Chương 1', position: 0, pgn })

    if (makeDrill) {
      const { data: drill } = await supabase
        .from('vt_drill_sets')
        .insert({ lesson_id: lesson.id, title: `${title} — Luyện tập`, pgn, orientation })
        .select('id')
        .single()

      if (drill) {
        const cards = generateCards(pgn, orientation).map((c) => ({
          drill_set_id: drill.id,
          lesson_id: lesson.id,
          fen: c.fen,
          expected_move: c.expectedMove
        }))
        if (cards.length > 0) await supabase.from('vt_srs_cards').insert(cards)
      }
    }
  }

  revalidatePath('/admin/lessons')
  revalidatePath('/learn')
  redirect('/admin/lessons')
}

export async function updateLesson(id: string, formData: FormData) {
  const { title, slug, difficulty, status } = schema.parse({
    title: formData.get('title'),
    slug: formData.get('slug'),
    difficulty: formData.get('difficulty'),
    status: formData.get('status')
  })
  const description = str(formData.get('description'))
  const videoId = str(formData.get('video_id'))

  const supabase = await createClient()
  const { error } = await supabase
    .from('vt_lessons')
    .update({ title, slug, description, video_id: videoId, difficulty, status })
    .eq('id', id)
  if (error) throw new Error(error.message)

  revalidatePath('/admin/lessons')
  revalidatePath('/learn')
  redirect('/admin/lessons')
}

export async function deleteLesson(id: string) {
  const supabase = await createClient()
  const { error } = await supabase.from('vt_lessons').delete().eq('id', id)
  if (error) throw new Error(error.message)
  revalidatePath('/admin/lessons')
  revalidatePath('/learn')
}
