import { Button } from '@/components/ui/button'
import { getDrillSetsForAdmin } from '@/lib/queries/learning'
import { createDrill, deleteDrill } from './actions'

const inputCls = 'border-border w-full rounded-md border px-3 py-2 text-sm outline-none focus:border-blue-500'

export default async function AdminDrillsPage() {
  const drills = await getDrillSetsForAdmin()

  return (
    <div className='space-y-6'>
      <h1 className='text-2xl font-bold'>Bài luyện tập (Drill) ({drills.length})</h1>

      <form action={createDrill} className='border-border max-w-3xl space-y-3 rounded-lg border p-4'>
        <input name='title' required placeholder='Tên bài luyện tập *' className={inputCls} />
        <textarea name='pgn' rows={5} required placeholder='Dán PGN...' className={inputCls} />
        <label className='flex items-center gap-2 text-sm'>
          Định hướng:
          <select name='orientation' defaultValue='white' className={inputCls}>
            <option value='white'>Trắng</option>
            <option value='black'>Đen</option>
          </select>
        </label>
        <Button type='submit'>+ Tạo & sinh thẻ ôn</Button>
      </form>

      <div className='border-border overflow-hidden rounded-lg border'>
        <table className='w-full text-sm'>
          <thead className='bg-secondary/50 text-left'>
            <tr>
              <th className='p-3'>Tên</th>
              <th className='p-3'>Định hướng</th>
              <th className='p-3'>Số thẻ</th>
              <th className='p-3 text-right'>Thao tác</th>
            </tr>
          </thead>
          <tbody>
            {drills.map((d) => (
              <tr key={d.id} className='border-border border-t'>
                <td className='p-3 font-medium'>{d.title}</td>
                <td className='p-3'>{d.orientation === 'white' ? 'Trắng' : 'Đen'}</td>
                <td className='p-3'>{d.cardCount}</td>
                <td className='p-3'>
                  <div className='flex justify-end gap-3'>
                    <a href={`/api/export/anki?drill=${d.id}`} className='underline'>
                      Tải Anki
                    </a>
                    <form action={deleteDrill.bind(null, d.id)}>
                      <button type='submit' className='text-red-500 underline'>
                        Xoá
                      </button>
                    </form>
                  </div>
                </td>
              </tr>
            ))}
            {drills.length === 0 && (
              <tr>
                <td colSpan={4} className='text-secondary-foreground p-6 text-center'>
                  Chưa có bài luyện tập nào.
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>
    </div>
  )
}
