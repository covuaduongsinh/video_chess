import { toAnkiTsv } from '@/lib/chess/anki'
import { createClient } from '@/lib/supabase/server'
import { NextResponse, type NextRequest } from 'next/server'

// Rate limit đơn giản bằng bộ nhớ (phù hợp single-instance; dùng Redis/KV cho multi-instance).
const rateMap = new Map<string, { count: number; resetAt: number }>()
const RATE_LIMIT = 20
const RATE_WINDOW_MS = 60_000

function isRateLimited(ip: string): boolean {
  const now = Date.now()
  const entry = rateMap.get(ip)
  if (!entry || now > entry.resetAt) {
    rateMap.set(ip, { count: 1, resetAt: now + RATE_WINDOW_MS })
    return false
  }
  entry.count += 1
  return entry.count > RATE_LIMIT
}

export async function GET(request: NextRequest) {
  const ip = request.headers.get('x-forwarded-for')?.split(',')[0].trim() ?? 'unknown'
  if (isRateLimited(ip)) {
    return NextResponse.json({ error: 'Quá nhiều yêu cầu. Vui lòng thử lại sau.' }, { status: 429 })
  }

  const drill = request.nextUrl.searchParams.get('drill')
  const lesson = request.nextUrl.searchParams.get('lesson')
  if (!drill && !lesson) {
    return NextResponse.json({ error: 'Thiếu tham số drill hoặc lesson' }, { status: 400 })
  }

  const supabase = await createClient()

  // Kiểm tra bài học/drill có tồn tại và đã publish không (trừ admin)
  const {
    data: { user }
  } = await supabase.auth.getUser()
  const isAdmin = user
    ? (await supabase.from('vt_profiles').select('role').eq('id', user.id).single()).data?.role === 'admin'
    : false

  if (!isAdmin) {
    if (drill) {
      const { data: ds } = await supabase
        .from('vt_drill_sets')
        .select('lesson_id')
        .eq('id', drill)
        .maybeSingle()
      if (!ds) return NextResponse.json({ error: 'Không tìm thấy bài luyện tập.' }, { status: 404 })
    }
    if (lesson) {
      const { data: ls } = await supabase
        .from('vt_lessons')
        .select('status')
        .eq('id', lesson)
        .maybeSingle()
      if (!ls || ls.status !== 'published')
        return NextResponse.json({ error: 'Bài học chưa xuất bản.' }, { status: 403 })
    }
  }
  let query = supabase.from('vt_srs_cards').select('fen, expected_move')
  query = drill ? query.eq('drill_set_id', drill) : query.eq('lesson_id', lesson!)
  const { data, error } = await query
  if (error) return NextResponse.json({ error: error.message }, { status: 500 })

  const cards = (data ?? []).map((c) => ({ fen: c.fen, expectedMove: c.expected_move }))
  const tsv = toAnkiTsv(cards)

  return new NextResponse(tsv, {
    headers: {
      'Content-Type': 'text/tab-separated-values; charset=utf-8',
      'Content-Disposition': `attachment; filename="anki-${drill ?? lesson}.txt"`
    }
  })
}
