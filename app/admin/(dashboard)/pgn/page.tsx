import { Button } from '@/components/ui/button'
import { getPgnGames } from '@/lib/queries/learning'
import { deletePgn, importPgn } from './actions'

const inputCls = 'border-border w-full rounded-md border px-3 py-2 text-sm outline-none focus:border-blue-500'

export default async function AdminPgnPage({ searchParams }: { searchParams: Promise<{ q?: string }> }) {
  const { q } = await searchParams
  const games = await getPgnGames(q)

  return (
    <div className='space-y-6'>
      <h1 className='text-2xl font-bold'>CSDL PGN ({games.length})</h1>

      <form action={importPgn} className='border-border max-w-3xl space-y-3 rounded-lg border p-4'>
        <input name='title' placeholder='Tiêu đề (tuỳ chọn)' className={inputCls} />
        <textarea name='pgn' rows={6} required placeholder='Dán nội dung PGN của một ván cờ...' className={inputCls} />
        <Button type='submit'>+ Nhập PGN</Button>
      </form>

      <form className='flex max-w-md gap-2' action='/admin/pgn'>
        <input name='q' defaultValue={q ?? ''} placeholder='Tìm theo đấu thủ / ECO...' className={inputCls} />
        <Button type='submit' variant='secondary'>
          Tìm
        </Button>
      </form>

      <div className='border-border overflow-hidden rounded-lg border'>
        <table className='w-full text-sm'>
          <thead className='bg-secondary/50 text-left'>
            <tr>
              <th className='p-3'>Tiêu đề</th>
              <th className='p-3'>Trắng</th>
              <th className='p-3'>Đen</th>
              <th className='p-3'>Kết quả</th>
              <th className='p-3'>ECO</th>
              <th className='p-3 text-right'>Thao tác</th>
            </tr>
          </thead>
          <tbody>
            {games.map((g) => (
              <tr key={g.id} className='border-border border-t'>
                <td className='p-3'>{g.title ?? '—'}</td>
                <td className='p-3'>{g.white ?? '—'}</td>
                <td className='p-3'>{g.black ?? '—'}</td>
                <td className='p-3'>{g.result ?? '—'}</td>
                <td className='p-3'>{g.eco ?? '—'}</td>
                <td className='p-3'>
                  <form action={deletePgn.bind(null, g.id)} className='text-right'>
                    <button type='submit' className='text-red-500 underline'>
                      Xoá
                    </button>
                  </form>
                </td>
              </tr>
            ))}
            {games.length === 0 && (
              <tr>
                <td colSpan={6} className='text-secondary-foreground p-6 text-center'>
                  Chưa có ván cờ nào.
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>
    </div>
  )
}
