import { Button } from '@/components/ui/button'
import { getChaptersForAdmin, getLessonForAdminById } from '@/lib/queries/learning'
import { getVideosForAdmin } from '@/lib/queries/videos'
import Link from 'next/link'
import { notFound } from 'next/navigation'
import { createChapter, deleteChapter, updateChapter, updateLesson } from '../actions'

const inputCls = 'border-border w-full rounded-md border px-3 py-2 text-sm outline-none focus:border-blue-500'
const labelCls = 'text-sm font-medium'

export default async function EditLessonPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params
  const [lesson, videos, chapters] = await Promise.all([
    getLessonForAdminById(id),
    getVideosForAdmin(),
    getChaptersForAdmin(id)
  ])
  if (!lesson) notFound()

  const action = updateLesson.bind(null, id)
  const hasVideo = !!lesson.videoId

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

      {/* Quản lý chương (PGN) + đồng bộ video */}
      <section className='max-w-3xl space-y-4'>
        <h2 className='text-xl font-bold'>Chương (PGN) &amp; đồng bộ video</h2>
        <p className='text-muted-foreground text-sm'>
          Mỗi chương gắn một thế cờ (PGN). Đặt “Mốc video” để bấm chương là tua video; mở “Studio đồng bộ” để gán mốc
          cho từng nước đi (chế độ karaoke).
        </p>

        {chapters.length === 0 && <p className='text-muted-foreground text-sm'>Chưa có chương nào.</p>}

        {chapters.map((c) => (
          <div key={c.id} className='border-border space-y-3 rounded-lg border p-4'>
            <form action={updateChapter.bind(null, c.id, id)} className='space-y-3'>
              <div className='grid grid-cols-3 gap-3'>
                <div>
                  <label className={labelCls}>Tiêu đề chương</label>
                  <input name='title' defaultValue={c.title ?? ''} className={inputCls} />
                </div>
                <div>
                  <label className={labelCls}>Thứ tự</label>
                  <input name='position' type='number' defaultValue={c.position} className={inputCls} />
                </div>
                <div>
                  <label className={labelCls}>Mốc video (giây hoặc M:SS)</label>
                  <input
                    name='video_timestamp'
                    defaultValue={c.videoTimestamp ?? ''}
                    placeholder='vd 90 hoặc 1:30'
                    className={inputCls}
                  />
                </div>
              </div>
              <div>
                <label className={labelCls}>PGN *</label>
                <textarea name='pgn' required rows={3} defaultValue={c.pgn} className={`${inputCls} font-mono`} />
              </div>
              <div className='flex flex-wrap items-center gap-3'>
                <Button type='submit' size='sm'>
                  Lưu chương
                </Button>
                <Button type='button' size='sm' variant='secondary' asChild>
                  <Link href={`/admin/lessons/${id}/sync/${c.id}`}>🎬 Studio đồng bộ ({c.moveCues.length} mốc)</Link>
                </Button>
              </div>
            </form>
            <form action={deleteChapter.bind(null, c.id, id)}>
              <Button type='submit' size='sm' variant='destructive'>
                Xoá chương
              </Button>
            </form>
          </div>
        ))}

        {/* Thêm chương mới */}
        <form action={createChapter.bind(null, id)} className='border-border space-y-3 rounded-lg border border-dashed p-4'>
          <h3 className='font-semibold'>+ Thêm chương</h3>
          <div className='grid grid-cols-3 gap-3'>
            <div>
              <label className={labelCls}>Tiêu đề chương</label>
              <input name='title' placeholder={`Chương ${chapters.length + 1}`} className={inputCls} />
            </div>
            <div>
              <label className={labelCls}>Thứ tự</label>
              <input name='position' type='number' defaultValue={chapters.length} className={inputCls} />
            </div>
            <div>
              <label className={labelCls}>Mốc video (giây hoặc M:SS)</label>
              <input name='video_timestamp' placeholder='vd 90 hoặc 1:30' className={inputCls} />
            </div>
          </div>
          <div>
            <label className={labelCls}>PGN *</label>
            <textarea name='pgn' required rows={3} placeholder='1. e4 e5 2. Nf3 ...' className={`${inputCls} font-mono`} />
          </div>
          <Button type='submit' size='sm'>
            Thêm chương
          </Button>
        </form>

        {!hasVideo && (
          <p className='text-muted-foreground text-sm'>
            Mẹo: bài học chưa gắn video. Gắn video ở trên rồi lưu để dùng được Studio đồng bộ.
          </p>
        )}
      </section>
    </div>
  )
}
