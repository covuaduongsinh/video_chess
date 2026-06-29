import { Button } from '@/components/ui/button'
import { getPlaylists } from '@/lib/queries/catalog'
import { createPlaylist, deletePlaylist } from './actions'

const inputCls = 'border-border w-full rounded-md border px-3 py-2 text-sm outline-none focus:border-blue-500'

export default async function AdminPlaylistsPage() {
  const playlists = await getPlaylists()

  return (
    <div className='space-y-6'>
      <h1 className='text-2xl font-bold'>Playlist ({playlists.length})</h1>

      <form action={createPlaylist} className='border-border grid max-w-3xl grid-cols-3 gap-3 rounded-lg border p-4'>
        <input name='name' required placeholder='Tên *' className={inputCls} />
        <input name='slug' required placeholder='Slug *' className={inputCls} />
        <input name='description' placeholder='Mô tả' className={inputCls} />
        <div>
          <Button type='submit'>+ Thêm playlist</Button>
        </div>
      </form>

      <div className='border-border overflow-hidden rounded-lg border'>
        <table className='w-full text-sm'>
          <thead className='bg-secondary/50 text-left'>
            <tr>
              <th className='p-3'>Tên</th>
              <th className='p-3'>Slug</th>
              <th className='p-3 text-right'>Thao tác</th>
            </tr>
          </thead>
          <tbody>
            {playlists.map((p) => (
              <tr key={p.id} className='border-border border-t'>
                <td className='p-3 font-medium'>{p.name}</td>
                <td className='text-secondary-foreground p-3'>{p.slug}</td>
                <td className='p-3'>
                  <form action={deletePlaylist.bind(null, p.id)} className='text-right'>
                    <button type='submit' className='text-red-500 underline'>
                      Xoá
                    </button>
                  </form>
                </td>
              </tr>
            ))}
            {playlists.length === 0 && (
              <tr>
                <td colSpan={3} className='text-secondary-foreground p-6 text-center'>
                  Chưa có playlist nào.
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>
    </div>
  )
}
