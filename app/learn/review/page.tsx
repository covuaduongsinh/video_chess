import { SrsReview } from '@/components/chess/srs-review'
import { AppShell } from '@/components/app-shell'
import { createClient } from '@/lib/supabase/server'
import type { Metadata } from 'next'
import { redirect } from 'next/navigation'

export const metadata: Metadata = { title: 'Ôn tập SRS' }

export default async function ReviewPage() {
  const supabase = await createClient()
  const {
    data: { user }
  } = await supabase.auth.getUser()
  if (!user) redirect('/login?redirect=/learn/review')

  // Lấy thẻ đến hạn ôn tập (due_at <= now) hoặc chưa có review
  const now = new Date().toISOString()
  const { data: dueReviews } = await supabase
    .from('vt_srs_reviews')
    .select('card_id')
    .eq('user_id', user.id)
    .lte('due_at', now)

  const dueCardIds = (dueReviews ?? []).map((r) => r.card_id)

  // Thẻ chưa có review (mới)
  const { data: allCards } = await supabase
    .from('vt_srs_cards')
    .select('id, fen, expected_move, drill_set_id, lesson_id')

  const reviewedIds = new Set(
    (await supabase.from('vt_srs_reviews').select('card_id').eq('user_id', user.id)).data?.map((r) => r.card_id) ?? []
  )

  const newCards = (allCards ?? []).filter((c) => !reviewedIds.has(c.id))
  const dueCards = (allCards ?? []).filter((c) => dueCardIds.includes(c.id))

  // Ưu tiên: thẻ mới trước, rồi đến thẻ đến hạn (tối đa 20 thẻ/phiên)
  const sessionCards = [...newCards, ...dueCards].slice(0, 20)

  return (
    <AppShell>
      <div className='mx-auto max-w-2xl'>
        <div className='mb-6'>
          <h1 className='text-2xl font-bold'>Ôn tập SRS</h1>
          <p className='text-muted-foreground text-sm'>
            {sessionCards.length === 0
              ? 'Không có thẻ nào cần ôn hôm nay!'
              : `${sessionCards.length} thẻ cần ôn (${newCards.length} mới, ${dueCards.length} đến hạn)`}
          </p>
        </div>

        {sessionCards.length === 0 ? (
          <div className='border-border rounded-lg border p-8 text-center'>
            <p className='text-4xl'>🎉</p>
            <p className='mt-2 font-semibold'>Tuyệt vời! Bạn đã ôn hết thẻ hôm nay.</p>
            <p className='text-muted-foreground mt-1 text-sm'>Quay lại vào ngày mai để tiếp tục.</p>
          </div>
        ) : (
          <SrsReview cards={sessionCards} />
        )}
      </div>
    </AppShell>
  )
}
