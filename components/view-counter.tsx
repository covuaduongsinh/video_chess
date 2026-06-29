'use client'

import { createClient } from '@/lib/supabase/client'
import { useEffect } from 'react'

/** Tăng lượt xem 1 lần / phiên trình duyệt cho mỗi video (chống lặp khi F5). */
export function ViewCounter({ videoId }: { videoId: string }) {
  useEffect(() => {
    const key = `vt_viewed_${videoId}`
    if (sessionStorage.getItem(key)) return
    sessionStorage.setItem(key, '1')
    createClient()
      .rpc('vt_increment_video_views', { p_video_id: videoId })
      .then(() => {})
  }, [videoId])

  return null
}
