import { AppShell } from '@/components/app-shell'
import { getPublicTournaments } from '@/lib/queries/tournaments'
import type { Metadata } from 'next'
import Link from 'next/link'

export const metadata: Metadata = {
  title: 'Giải đấu',
  description: 'Lịch giải đấu cờ vua Dương Sinh'
}

const STATUS_LABEL: Record<string, { label: string; cls: string }> = {
  upcoming: { label: 'Sắp diễn ra', cls: 'bg-blue-500/15 text-blue-700 dark:text-blue-300' },
  ongoing:  { label: 'Đang diễn ra', cls: 'bg-green-500/15 text-green-700 dark:text-green-300' },
  finished: { label: 'Đã kết thúc', cls: 'bg-secondary text-muted-foreground' },
  cancelled:{ label: 'Đã huỷ', cls: 'bg-red-500/10 text-red-600' }
}

function fmtDate(d: string | null) {
  if (!d) return ''
  return new Date(d).toLocaleDateString('vi-VN', { day: '2-digit', month: '2-digit', year: 'numeric' })
}

export default async function TournamentsPage() {
  const tournaments = await getPublicTournaments()

  return (
    <AppShell>
      <div className='mx-auto max-w-3xl space-y-6'>
        <h1 className='text-2xl font-bold'>Giải đấu cờ vua Dương Sinh</h1>

        {tournaments.length === 0 ? (
          <p className='text-muted-foreground py-12 text-center'>Chưa có giải đấu nào được công bố.</p>
        ) : (
          <div className='space-y-4'>
            {tournaments.map((t) => {
              const st = STATUS_LABEL[t.status] ?? STATUS_LABEL.upcoming
              return (
                <Link
                  key={t.id}
                  href={`/tournaments/${t.slug}`}
                  className='border-border hover:bg-accent/30 block rounded-xl border p-5 transition-colors'
                >
                  <div className='flex items-start justify-between gap-3'>
                    <div className='space-y-1'>
                      <h2 className='font-semibold'>{t.title}</h2>
                      {t.description && (
                        <p className='text-muted-foreground line-clamp-2 text-sm'>{t.description}</p>
                      )}
                      <div className='text-muted-foreground flex flex-wrap gap-3 text-xs'>
                        {(t.dateStart || t.dateEnd) && (
                          <span>
                            {fmtDate(t.dateStart)}
                            {t.dateEnd && t.dateEnd !== t.dateStart ? ` – ${fmtDate(t.dateEnd)}` : ''}
                          </span>
                        )}
                        {t.location && <span>📍 {t.location}</span>}
                        {t.prizeInfo && <span>🏆 {t.prizeInfo}</span>}
                      </div>
                    </div>
                    <span className={`shrink-0 rounded-full px-2.5 py-0.5 text-xs font-medium ${st.cls}`}>
                      {st.label}
                    </span>
                  </div>
                </Link>
              )
            })}
          </div>
        )}
      </div>
    </AppShell>
  )
}
