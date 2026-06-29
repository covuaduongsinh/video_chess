// Trang 404 — hiển thị khi không tìm thấy nội dung (notFound() hoặc route không khớp).
import { Button } from '@/components/ui/button'
import Link from 'next/link'

export default function NotFound() {
  return (
    <div className='flex min-h-[60vh] flex-col items-center justify-center gap-4 px-4 text-center'>
      <h2 className='text-2xl font-bold'>404 — Không tìm thấy</h2>
      <p className='text-secondary-foreground max-w-md text-sm'>
        Nội dung bạn tìm không tồn tại hoặc đã bị gỡ.
      </p>
      <Button asChild>
        <Link href='/'>Về trang chủ</Link>
      </Button>
    </div>
  )
}
