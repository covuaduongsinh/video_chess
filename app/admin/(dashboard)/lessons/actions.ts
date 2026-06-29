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

const VALID_LEVELS = ['tot', 'ma', 'tuong', 'xe', 'hau', 'vua'] as const
type Level = (typeof VALID_LEVELS)[number]

function parseLevel(v: FormDataEntryValue | null): Level | null {
  const s = str(v)
  return s && (VALID_LEVELS as readonly string[]).includes(s) ? (s as Level) : null
}

export async function createLesson(formData: FormData) {
  const { title, slug, difficulty, status } = schema.parse({
    title: formData.get('title'),
    slug: formData.get('slug'),
    difficulty: formData.get('difficulty'),
    status: formData.get('status')
  })
  const description = str(formData.get('description'))
  const videoId = str(formData.get('video_id'))
  const level = parseLevel(formData.get('level'))
  const pgn = str(formData.get('pgn'))
  const orientation = (str(formData.get('orientation')) ?? 'white') as 'white' | 'black'
  const makeDrill = formData.get('make_drill') === 'on'

  if (pgn && !isValidPgn(pgn)) throw new Error('PGN không hợp lệ')

  const supabase = await createClient()
  const { data: lesson, error } = await supabase
    .from('vt_lessons')
    .insert({ title, slug, description, video_id: videoId, difficulty, status, level })
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
  const level = parseLevel(formData.get('level'))

  const supabase = await createClient()
  const { error } = await supabase
    .from('vt_lessons')
    .update({ title, slug, description, video_id: videoId, difficulty, status, level })
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

// --- Quản lý chương (PGN) -------------------------------------------------

/** Nhận mốc thời gian dạng "M:SS" hoặc số giây → giây (int) | null. */
function parseSeconds(v: FormDataEntryValue | null): number | null {
  const s = str(v)
  if (!s) return null
  if (s.includes(':')) {
    const [m, sec] = s.split(':')
    const mm = Number(m)
    const ss = Number(sec)
    return Number.isFinite(mm) && Number.isFinite(ss) ? mm * 60 + ss : null
  }
  const n = Number(s)
  return Number.isFinite(n) ? Math.round(n) : null
}

function chapterFields(formData: FormData) {
  const title = str(formData.get('title'))
  const pgn = str(formData.get('pgn'))
  const position = Number(str(formData.get('position')) ?? '0') || 0
  const videoTimestamp = parseSeconds(formData.get('video_timestamp'))
  if (!pgn || !isValidPgn(pgn)) throw new Error('PGN không hợp lệ')
  return { title, pgn, position, video_timestamp: videoTimestamp }
}

export async function createChapter(lessonId: string, formData: FormData) {
  const supabase = await createClient()
  const { error } = await supabase
    .from('vt_lesson_chapters')
    .insert({ lesson_id: lessonId, ...chapterFields(formData) })
  if (error) throw new Error(error.message)
  revalidatePath(`/admin/lessons/${lessonId}`)
  revalidatePath('/learn')
}

export async function updateChapter(chapterId: string, lessonId: string, formData: FormData) {
  const supabase = await createClient()
  const { error } = await supabase.from('vt_lesson_chapters').update(chapterFields(formData)).eq('id', chapterId)
  if (error) throw new Error(error.message)
  revalidatePath(`/admin/lessons/${lessonId}`)
  revalidatePath('/learn')
}

export async function deleteChapter(chapterId: string, lessonId: string) {
  const supabase = await createClient()
  const { error } = await supabase.from('vt_lesson_chapters').delete().eq('id', chapterId)
  if (error) throw new Error(error.message)
  revalidatePath(`/admin/lessons/${lessonId}`)
  revalidatePath('/learn')
}

const cueSchema = z.array(z.object({ idx: z.number().int().min(0), t: z.number().min(0) }))

/** Lưu mốc đồng bộ theo nước cho một chương (gọi từ Sync Studio). */
export async function saveChapterCues(chapterId: string, lessonId: string, cues: { idx: number; t: number }[]) {
  const parsed = cueSchema.parse(cues)
  // Khử trùng theo idx (giữ mốc cuối cùng), rồi sắp theo idx.
  const map = new Map<number, number>()
  for (const c of parsed) map.set(c.idx, c.t)
  const clean = [...map.entries()].map(([idx, t]) => ({ idx, t })).sort((a, b) => a.idx - b.idx)

  const supabase = await createClient()
  const { error } = await supabase.from('vt_lesson_chapters').update({ move_cues: clean }).eq('id', chapterId)
  if (error) throw new Error(error.message)
  revalidatePath(`/admin/lessons/${lessonId}/sync/${chapterId}`)
  revalidatePath('/learn')
}
