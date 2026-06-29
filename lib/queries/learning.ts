import { createClient } from '@/lib/supabase/server'
import { getVideoById, type VideoDetail } from '@/lib/queries/videos'
import type { MoveCue } from '@/lib/video/player'

/** Đọc an toàn cột jsonb move_cues thành mảng MoveCue (bỏ qua dữ liệu hỏng). */
function parseMoveCues(raw: unknown): MoveCue[] {
  if (!Array.isArray(raw)) return []
  return raw
    .filter(
      (x): x is MoveCue =>
        !!x && typeof x === 'object' && typeof (x as MoveCue).idx === 'number' && typeof (x as MoveCue).t === 'number'
    )
    .map((x) => ({ idx: x.idx, t: x.t }))
    .sort((a, b) => a.idx - b.idx)
}

export type LessonCard = {
  id: string
  title: string
  slug: string
  description: string | null
  difficulty: string
  level: string | null
}

export type LessonChapter = {
  id: string
  title: string | null
  position: number
  pgn: string
  videoTimestamp: number | null
  moveCues: MoveCue[]
}

export type DrillSet = {
  id: string
  title: string
  pgn: string
  orientation: 'white' | 'black'
}

export type LessonDetail = LessonCard & {
  video: VideoDetail | null
  chapters: LessonChapter[]
  drills: DrillSet[]
}

export async function getPublishedLessons(level?: string): Promise<LessonCard[]> {
  const supabase = await createClient()
  let q = supabase
    .from('vt_lessons')
    .select('id, title, slug, description, difficulty, level')
    .eq('status', 'published')
    .order('created_at', { ascending: false })
  if (level) q = q.eq('level', level)
  const { data } = await q
  return data ?? []
}

export async function getLessonForAdminById(
  id: string
): Promise<(LessonCard & { status: string; videoId: string | null }) | null> {
  const supabase = await createClient()
  const { data } = await supabase
    .from('vt_lessons')
    .select('id, title, slug, description, difficulty, level, status, video_id')
    .eq('id', id)
    .maybeSingle()
  if (!data) return null
  return {
    id: data.id,
    title: data.title,
    slug: data.slug,
    description: data.description,
    difficulty: data.difficulty,
    level: data.level,
    status: data.status,
    videoId: data.video_id
  }
}

export async function getLessonsForAdmin(): Promise<(LessonCard & { status: string })[]> {
  const supabase = await createClient()
  const { data } = await supabase
    .from('vt_lessons')
    .select('id, title, slug, description, difficulty, level, status')
    .order('created_at', { ascending: false })
  return data ?? []
}

export type LinkedLesson = { slug: string; title: string; difficulty: string }

/** Bài học (đã publish) gắn với một video — cầu nối Video → Học. */
export async function getLessonByVideoId(videoId: string): Promise<LinkedLesson | null> {
  const supabase = await createClient()
  const { data } = await supabase
    .from('vt_lessons')
    .select('slug, title, difficulty')
    .eq('video_id', videoId)
    .eq('status', 'published')
    .maybeSingle<LinkedLesson>()
  return data ?? null
}

export async function getLessonBySlug(slug: string): Promise<LessonDetail | null> {
  const supabase = await createClient()
  const { data: lesson } = await supabase
    .from('vt_lessons')
    .select('id, title, slug, description, difficulty, level, video_id')
    .eq('slug', slug)
    .maybeSingle()
  if (!lesson) return null

  const [{ data: chapters }, { data: drills }, video] = await Promise.all([
    supabase
      .from('vt_lesson_chapters')
      .select('id, title, position, pgn, video_timestamp, move_cues')
      .eq('lesson_id', lesson.id)
      .order('position', { ascending: true }),
    supabase.from('vt_drill_sets').select('id, title, pgn, orientation').eq('lesson_id', lesson.id),
    lesson.video_id ? getVideoById(lesson.video_id) : Promise.resolve(null)
  ])

  return {
    id: lesson.id,
    title: lesson.title,
    slug: lesson.slug,
    description: lesson.description,
    difficulty: lesson.difficulty,
    level: lesson.level,
    video,
    chapters: (chapters ?? []).map((c) => ({
      id: c.id,
      title: c.title,
      position: c.position,
      pgn: c.pgn,
      videoTimestamp: c.video_timestamp,
      moveCues: parseMoveCues(c.move_cues)
    })),
    drills: (drills ?? []).map((d) => ({
      id: d.id,
      title: d.title,
      pgn: d.pgn,
      orientation: d.orientation as 'white' | 'black'
    }))
  }
}

/** Danh sách chương của một bài học (cho admin quản lý + gán mốc). */
export async function getChaptersForAdmin(lessonId: string): Promise<LessonChapter[]> {
  const supabase = await createClient()
  const { data } = await supabase
    .from('vt_lesson_chapters')
    .select('id, title, position, pgn, video_timestamp, move_cues')
    .eq('lesson_id', lessonId)
    .order('position', { ascending: true })
  return (data ?? []).map((c) => ({
    id: c.id,
    title: c.title,
    position: c.position,
    pgn: c.pgn,
    videoTimestamp: c.video_timestamp,
    moveCues: parseMoveCues(c.move_cues)
  }))
}

export type ChapterSyncData = LessonChapter & { lessonId: string; video: VideoDetail | null }

/** Một chương + video của bài học chứa nó — dữ liệu cho Sync Studio. */
export async function getChapterForSync(chapterId: string): Promise<ChapterSyncData | null> {
  const supabase = await createClient()
  const { data: c } = await supabase
    .from('vt_lesson_chapters')
    .select('id, lesson_id, title, position, pgn, video_timestamp, move_cues')
    .eq('id', chapterId)
    .maybeSingle()
  if (!c) return null

  const { data: lesson } = await supabase.from('vt_lessons').select('video_id').eq('id', c.lesson_id).maybeSingle()
  const video = lesson?.video_id ? await getVideoById(lesson.video_id) : null

  return {
    id: c.id,
    lessonId: c.lesson_id,
    title: c.title,
    position: c.position,
    pgn: c.pgn,
    videoTimestamp: c.video_timestamp,
    moveCues: parseMoveCues(c.move_cues),
    video
  }
}

export async function getDrillSetsForAdmin(): Promise<
  { id: string; title: string; orientation: string; cardCount: number }[]
> {
  const supabase = await createClient()
  const { data } = await supabase
    .from('vt_drill_sets')
    .select('id, title, orientation, vt_srs_cards(count)')
    .order('created_at', { ascending: false })
    .returns<{ id: string; title: string; orientation: string; vt_srs_cards: { count: number }[] }[]>()
  return (data ?? []).map((d) => ({
    id: d.id,
    title: d.title,
    orientation: d.orientation,
    cardCount: d.vt_srs_cards?.[0]?.count ?? 0
  }))
}

export type PgnGameRow = {
  id: string
  title: string | null
  white: string | null
  black: string | null
  result: string | null
  eco: string | null
}

export type RelatedGame = {
  id: string
  title: string | null
  white: string | null
  black: string | null
  result: string | null
  eco: string | null
  pgn: string
}

/** Ván cờ được gắn (curated) cho một video — "khám phá ngược" Video → ván cờ. */
export async function getRelatedGamesForVideo(videoId: string): Promise<RelatedGame[]> {
  const supabase = await createClient()
  const { data } = await supabase
    .from('vt_video_pgn_games')
    .select('position, vt_pgn_games(id, title, white, black, result, eco, pgn)')
    .eq('video_id', videoId)
    .order('position', { ascending: true })
    .returns<{ position: number; vt_pgn_games: RelatedGame | null }[]>()
  return (data ?? []).map((r) => r.vt_pgn_games).filter((g): g is RelatedGame => !!g)
}

/** Danh sách id ván cờ đã gắn với video (cho UI admin). */
export async function getLinkedGameIds(videoId: string): Promise<string[]> {
  const supabase = await createClient()
  const { data } = await supabase.from('vt_video_pgn_games').select('pgn_game_id').eq('video_id', videoId)
  return (data ?? []).map((r) => r.pgn_game_id)
}

export async function getPgnGames(search?: string): Promise<PgnGameRow[]> {
  const supabase = await createClient()
  let q = supabase
    .from('vt_pgn_games')
    .select('id, title, white, black, result, eco')
    .order('created_at', { ascending: false })
    .limit(200)
  if (search && search.trim()) {
    const s = `%${search.trim()}%`
    q = q.or(`white.ilike.${s},black.ilike.${s},eco.ilike.${s},title.ilike.${s}`)
  }
  const { data } = await q
  return data ?? []
}
