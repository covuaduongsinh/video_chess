'use server'

import { sm2, type SrsState } from '@/lib/chess/srs'
import { createClient } from '@/lib/supabase/server'

/**
 * Ghi kết quả ôn tập một thẻ SRS vào vt_srs_reviews.
 * Tính toán lịch tiếp theo bằng SM-2 rồi upsert.
 * Trả về lỗi (string) hoặc null nếu thành công.
 */
export async function submitSrsReview(cardId: string, quality: number): Promise<string | null> {
  if (quality < 0 || quality > 5) return 'quality phải từ 0 đến 5'

  const supabase = await createClient()
  const {
    data: { user }
  } = await supabase.auth.getUser()
  if (!user) return 'Bạn cần đăng nhập để ôn tập.'

  // Lấy review hiện tại (nếu có)
  const { data: existing } = await supabase
    .from('vt_srs_reviews')
    .select('repetitions, ease_factor, interval_days')
    .eq('user_id', user.id)
    .eq('card_id', cardId)
    .maybeSingle()

  const prev: SrsState = existing
    ? {
        repetitions: existing.repetitions,
        easeFactor: existing.ease_factor,
        intervalDays: existing.interval_days
      }
    : { repetitions: 0, easeFactor: 2.5, intervalDays: 0 }

  const result = sm2(prev, quality)

  const { error } = await supabase.from('vt_srs_reviews').upsert(
    {
      user_id: user.id,
      card_id: cardId,
      repetitions: result.repetitions,
      ease_factor: result.easeFactor,
      interval_days: result.intervalDays,
      due_at: result.dueAt,
      last_reviewed_at: new Date().toISOString()
    },
    { onConflict: 'user_id,card_id' }
  )

  return error?.message ?? null
}

/**
 * Ghi kết quả hoàn thành một bài drill.
 */
export async function submitDrillAttempt(
  drillSetId: string,
  errors: number,
  durationSeconds: number
): Promise<string | null> {
  const supabase = await createClient()
  const {
    data: { user }
  } = await supabase.auth.getUser()
  if (!user) return null // Không đăng nhập → bỏ qua, không báo lỗi

  const { error } = await supabase.from('vt_drill_attempts').insert({
    user_id: user.id,
    drill_set_id: drillSetId,
    errors,
    duration_seconds: durationSeconds
  })

  return error?.message ?? null
}
