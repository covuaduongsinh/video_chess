import { Button } from '@/components/ui/button'
import { getLessonForAdminById } from '@/lib/queries/learning'
import { getVideosForAdmin } from '@/lib/queries/videos'
import Link from 'next/link'
import { notFound } from 'next/navigation'
import { updateLesson } from '../actions'

const inputCls = 'border-border w-full rounded-md border px-3 py-2 text-sm outline-none focus:border-blue-500'
const labelCls = 'text-sm font-medium'

export default async function EditLessonPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params
  const [lesson, videos] = await Promise.all([getLessonForAdminById(id), getVideosForAdmin()])
  if (!lesson) notFound()

  const action = updateLesson.bind(null, id)

  return (
    <div className='space-y-6'>
      <div className='flex items-center gap-3'>
        <Link href='/admin/lessons' className='text-muted-foreground text-sm underline'>
          ← Danh sách bài học
        </Link>
        <h1 className='text-2xl font-bold'>Sửa bài học</h1>
      </div>

      <form action={action} className='border-border max-w-3xl space-y-3 rounded-lg border p-4'>
        <div className='grid grid-cols-2 gap-3'>
          <div>
            <label className={labelCls} htmlFor='title'>
              Tiêu đề *
            </label>
            <input id='title' name='title' required defaultValue={lesson.title} className={inputCls} />
          </div>
          <div>
            <label className={labelCls} htmlFor='slug'>
              Slug *
            </label>
            <input id='slug' name='slug' required defaultValue={lesson.slug} className={inputCls} />
          </div>
        </div>

        <div>
          <label className={labelCls} htmlFor='description'>
            Mô tả
          </label>
          <textarea id='description' name='description' rows={3} defaultValue={lesson.description ?? ''} className={inputCls} />
        </div>

        <div className='grid grid-cols-4 gap-3'>
          <div>
            <label className={labelCls} htmlFor='video_id'>
              Video
            </label>
            <select id='video_id' name='video_id' defaultValue={lesson.videoId ?? ''} className={inputCls}>
              <option value=''>— Không —</option>
              {videos.map((v) => (
                <option key={v.id} value={v.id}>
                  {v.title}
                </option>
              ))}
            </select>
          </div>
          <div>
            <label className={labelCls} htmlFor='level'>
              Cấp (lộ trình)
            </label>
            <select id='level' name='level' defaultValue={lesson.level ?? ''} className={inputCls}>
              <option value=''>— Chưa phân cấp —</option>
              <option value='tot'>♟ Tốt (Cấp 1)</option>
              <option value='ma'>♞ Mã (Cấp 2)</option>
              <option value='tuong'>♝ Tượng (Cấp 3)</option>
              <option value='xe'>♜ Xe (Cấp 4)</option>
              <option value='hau'>♛ Hậu (Cấp 5)</option>
              <option value='vua'>♚ Vua (Cấp 6)</option>
            </select>
          </div>
          <div>
            <label className={labelCls} htmlFor='difficulty'>
              Độ khó
            </label>
            <select id='difficulty' name='difficulty' defaultValue={lesson.difficulty} className={inputCls}>
              <option value='beginner'>Cơ bản</option>
              <option value='intermediate'>Trung cấp</option>
              <option value='advanced'>Nâng cao</option>
            </select>
          </div>
          <div>
            <label className={labelCls} htmlFor='status'>
              Trạng thái
            </label>
            <select id='status' name='status' defaultValue={lesson.status} className={inputCls}>
              <option value='draft'>Nháp</option>
              <option value='published'>Xuất bản</option>
              <option value='hidden'>Ẩn</option>
            </select>
          </div>
        </div>

        <div className='flex gap-3'>
          <Button type='submit'>Lưu thay đổi</Button>
          <Button type='button' variant='outline' asChild>
            <Link href='/admin/lessons'>Huỷ</Link>
          </Button>
        </div>
      </form>
    </div>
  )
}
