import { toAnkiTsv } from '@/lib/chess/anki'
import { createClient } from '@/lib/supabase/server'
import { NextResponse, type NextRequest } from 'next/server'

export async function GET(request: NextRequest) {
  const drill = request.nextUrl.searchParams.get('drill')
  const lesson = request.nextUrl.searchParams.get('lesson')
  if (!drill && !lesson) {
    return NextResponse.json({ error: 'Thiếu tham số drill hoặc lesson' }, { status: 400 })
  }

  const supabase = await createClient()
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
