import { Button } from '@/components/ui/button'
import { getAllChannels } from '@/lib/queries/catalog'
import { createChannel, deleteChannel } from './actions'

const inputCls = 'border-border w-full rounded-md border px-3 py-2 text-sm outline-none focus:border-blue-500'

export default async function AdminChannelsPage() {
  const channels = await getAllChannels()

  return (
    <div className='space-y-6'>
      <h1 className='text-2xl font-bold'>Kênh ({channels.length})</h1>

      <form action={createChannel} className='border-border grid max-w-3xl grid-cols-2 gap-3 rounded-lg border p-4'>
        <input name='name' placeholder='Tên kênh *' required className={inputCls} />
        <input name='slug' placeholder='Slug (vd: gm-le-quang-liem) *' required className={inputCls} />
        <input name='avatar_url' placeholder='Avatar URL' className={inputCls} />
        <input name='description' placeholder='Mô tả' className={inputCls} />
        <div>
          <Button type='submit'>+ Thêm kênh</Button>
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
            {channels.map((c) => (
              <tr key={c.id} className='border-border border-t'>
                <td className='p-3 font-medium'>{c.name}</td>
                <td className='text-secondary-foreground p-3'>{c.slug}</td>
                <td className='p-3'>
                  <form action={deleteChannel.bind(null, c.id)} className='text-right'>
                    <button type='submit' className='text-red-500 underline'>
                      Xoá
                    </button>
                  </form>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  )
}
