import { Button } from '@/components/ui/button'
import { getVideosForAdmin } from '@/lib/queries/videos'
import { viewCount } from '@/lib/utils'
import Link from 'next/link'
import { deleteVideo } from './actions'

const STATUS_LABEL: Record<string, string> = { draft: 'Nháp', published: 'Xuất bản', hidden: 'Ẩn' }

export default async function AdminVideosPage() {
  const videos = await getVideosForAdmin()

  return (
    <div className='space-y-4'>
      <div className='flex items-center justify-between'>
        <h1 className='text-2xl font-bold'>Video ({videos.length})</h1>
        <Button asChild>
          <Link href='/admin/videos/new'>+ Thêm video</Link>
        </Button>
      </div>

      <div className='border-border overflow-hidden rounded-lg border'>
        <table className='w-full text-sm'>
          <thead className='bg-secondary/50 text-left'>
            <tr>
              <th className='p-3'>Tiêu đề</th>
              <th className='p-3'>Kênh</th>
              <th className='p-3'>Trạng thái</th>
              <th className='p-3'>Lượt xem</th>
              <th className='p-3 text-right'>Thao tác</th>
            </tr>
          </thead>
          <tbody>
            {videos.map((v) => (
              <tr key={v.id} className='border-border border-t'>
                <td className='p-3 font-medium'>{v.title}</td>
                <td className='text-secondary-foreground p-3'>{v.channelName ?? '—'}</td>
                <td className='p-3'>{STATUS_LABEL[v.status] ?? v.status}</td>
                <td className='p-3'>{viewCount(v.views)}</td>
                <td className='p-3'>
                  <div className='flex justify-end gap-2'>
                    <Link href={`/admin/videos/${v.id}`} className='underline'>
                      Sửa
                    </Link>
                    <form action={deleteVideo.bind(null, v.id)}>
                      <button type='submit' className='text-red-500 underline'>
                        Xoá
                      </button>
                    </form>
                  </div>
                </td>
              </tr>
            ))}
            {videos.length === 0 && (
              <tr>
                <td colSpan={5} className='text-secondary-foreground p-6 text-center'>
                  Chưa có video. Bấm “Thêm video”.
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>
    </div>
  )
}
