import { getTournamentsForAdmin } from '@/lib/queries/tournaments'
import Link from 'next/link'
import { DeleteTournamentButton } from './delete-button'

export default async function AdminTournamentsPage() {
  const tournaments = await getTournamentsForAdmin()

  return (
    <div className='space-y-6'>
      <div className='flex items-center justify-between'>
        <h1 className='text-2xl font-bold'>Giải đấu</h1>
        <Link href='/admin/tournaments/new' className='bg-primary text-primary-foreground rounded-md px-3 py-1.5 text-sm'>
          + Tạo giải đấu
        </Link>
      </div>

      {tournaments.length === 0 ? (
        <p className='text-muted-foreground py-8 text-center'>Chưa có giải đấu nào.</p>
      ) : (
        <div className='overflow-x-auto'>
          <table className='w-full text-sm'>
            <thead>
              <tr className='border-b text-left'>
                <th className='pb-2 pr-4 font-medium'>Tiêu đề</th>
                <th className='pb-2 pr-4 font-medium'>Slug</th>
                <th className='pb-2 pr-4 font-medium'>Trạng thái</th>
                <th className='pb-2 pr-4 font-medium'>Ngày bắt đầu</th>
                <th className='pb-2'></th>
              </tr>
            </thead>
            <tbody className='divide-y'>
              {tournaments.map((t) => (
                <tr key={t.id}>
                  <td className='py-2 pr-4 font-medium'>{t.title}</td>
                  <td className='text-muted-foreground py-2 pr-4'>{t.slug}</td>
                  <td className='py-2 pr-4'>{t.status}</td>
                  <td className='text-muted-foreground py-2 pr-4'>{t.dateStart ?? '—'}</td>
                  <td className='py-2'>
                    <DeleteTournamentButton id={t.id} />
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  )
}
