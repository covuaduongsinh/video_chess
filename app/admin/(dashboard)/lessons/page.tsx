import { Button } from '@/components/ui/button'
import { getLessonsForAdmin } from '@/lib/queries/learning'
import { getVideosForAdmin } from '@/lib/queries/videos'
import Link from 'next/link'
import { createLesson, deleteLesson } from './actions'

const inputCls = 'border-border w-full rounded-md border px-3 py-2 text-sm outline-none focus:border-blue-500'
const labelCls = 'text-sm font-medium'

export default async function AdminLessonsPage() {
  const [lessons, videos] = await Promise.all([getLessonsForAdmin(), getVideosForAdmin()])

  return (
    <div className='space-y-6'>
      <h1 className='text-2xl font-bold'>Bài học ({lessons.length})</h1>

      <form action={createLesson} className='border-border max-w-3xl space-y-3 rounded-lg border p-4'>
        <div className='grid grid-cols-2 gap-3'>
          <div>
            <label className={labelCls}>Tiêu đề *</label>
            <input name='title' required className={inputCls} />
          </div>
          <div>
            <label className={labelCls}>Slug *</label>
            <input name='slug' required placeholder='vd: khai-cuoc-sicilian' className={inputCls} />
          </div>
        </div>
        <div>
          <label className={labelCls}>Mô tả</label>
          <textarea name='description' rows={2} className={inputCls} />
        </div>
        <div className='grid grid-cols-4 gap-3'>
          <div>
            <label className={labelCls}>Video</label>
            <select name='video_id' className={inputCls}>
              <option value=''>— Không —</option>
              {videos.map((v) => (
                <option key={v.id} value={v.id}>
                  {v.title}
                </option>
              ))}
            </select>
          </div>
          <div>
            <label className={labelCls}>Cấp (lộ trình)</label>
            <select name='level' className={inputCls} defaultValue=''>
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
            <label className={labelCls}>Độ khó</label>
            <select name='difficulty' className={inputCls} defaultValue='beginner'>
              <option value='beginner'>Cơ bản</option>
              <option value='intermediate'>Trung cấp</option>
              <option value='advanced'>Nâng cao</option>
            </select>
          </div>
          <div>
            <label className={labelCls}>Trạng thái</label>
            <select name='status' className={inputCls} defaultValue='draft'>
              <option value='draft'>Nháp</option>
              <option value='published'>Xuất bản</option>
              <option value='hidden'>Ẩn</option>
            </select>
          </div>
        </div>
        <div>
          <label className={labelCls}>PGN (Chương 1)</label>
          <textarea name='pgn' rows={5} placeholder='Dán PGN minh hoạ cho bài học...' className={inputCls} />
        </div>
        <div className='flex items-center gap-4'>
          <label className='flex items-center gap-2 text-sm'>
            Định hướng:
            <select name='orientation' className={inputCls} defaultValue='white'>
              <option value='white'>Trắng</option>
              <option value='black'>Đen</option>
            </select>
          </label>
          <label className='flex items-center gap-2 text-sm'>
            <input type='checkbox' name='make_drill' defaultChecked /> Tạo bài luyện tập + thẻ ôn (SRS) từ PGN
          </label>
        </div>
        <Button type='submit'>+ Tạo bài học</Button>
      </form>

      <div className='border-border overflow-hidden rounded-lg border'>
        <table className='w-full text-sm'>
          <thead className='bg-secondary/50 text-left'>
            <tr>
              <th className='p-3'>Tiêu đề</th>
              <th className='p-3'>Độ khó</th>
              <th className='p-3'>Trạng thái</th>
              <th className='p-3 text-right'>Thao tác</th>
            </tr>
          </thead>
          <tbody>
            {lessons.map((l) => (
              <tr key={l.id} className='border-border border-t'>
                <td className='p-3 font-medium'>{l.title}</td>
                <td className='p-3'>{l.difficulty}</td>
                <td className='p-3'>{l.status}</td>
                <td className='p-3'>
                  <div className='flex justify-end gap-3'>
                    <Link href={`/admin/lessons/${l.id}`} className='underline'>
                      Sửa
                    </Link>
                    <Link href={`/learn/${l.slug}`} className='underline'>
                      Mở
                    </Link>
                    <form action={deleteLesson.bind(null, l.id)}>
                      <button type='submit' className='text-red-500 underline'>
                        Xoá
                      </button>
                    </form>
                  </div>
                </td>
              </tr>
            ))}
            {lessons.length === 0 && (
              <tr>
                <td colSpan={4} className='text-secondary-foreground p-6 text-center'>
                  Chưa có bài học nào.
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>
    </div>
  )
}
