'use client'

// Ranh giới lỗi (error boundary) cho các route — hiển thị khi render phía server/client ném lỗi.
import { Button } from '@/components/ui/button'
import { useEffect } from 'react'

export default function Error({ error, reset }: { error: Error & { digest?: string }; reset: () => void }) {
  useEffect(() => {
    // TODO (Đợt 4): gửi lỗi tới hệ thống giám sát (Sentry...).
    console.error(error)
  }, [error])

  return (
    <div className='flex min-h-[60vh] flex-col items-center justify-center gap-4 px-4 text-center'>
      <h2 className='text-xl font-semibold'>Đã có lỗi xảy ra</h2>
      <p className='text-secondary-foreground max-w-md text-sm'>
        Xin lỗi, trang gặp sự cố khi tải. Bạn có thể thử lại.
      </p>
      <Button onClick={reset}>Thử lại</Button>
    </div>
  )
}
