import { AppShell } from '@/components/app-shell'
import { getTournamentBySlug } from '@/lib/queries/tournaments'
import type { Metadata } from 'next'
import Image from 'next/image'
import { notFound } from 'next/navigation'

type Props = { params: Promise<{ slug: string }> }

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { slug } = await params
  const t = await getTournamentBySlug(slug)
  if (!t) return {}
  return { title: t.title, description: t.description ?? undefined }
}

const STATUS_LABEL: Record<string, string> = {
  upcoming: 'Sắp diễn ra',
  ongoing: 'Đang diễn ra',
  finished: 'Đã kết thúc',
  cancelled: 'Đã huỷ'
}

function fmtDate(d: string | null) {
  if (!d) return ''
  return new Date(d).toLocaleDateString('vi-VN', { day: '2-digit', month: '2-digit', year: 'numeric' })
}

export default async function TournamentDetailPage({ params }: Props) {
  const { slug } = await params
  const t = await getTournamentBySlug(slug)
  if (!t) notFound()

  return (
    <AppShell>
      <article className='mx-auto max-w-2xl space-y-6'>
        <div className='space-y-2'>
          <h1 className='text-2xl font-bold'>{t.title}</h1>
          <span className='text-muted-foreground text-sm'>{STATUS_LABEL[t.status] ?? t.status}</span>
        </div>

        {t.coverUrl && (
          <div className='relative h-64 w-full overflow-hidden rounded-xl'>
            <Image src={t.coverUrl} alt={t.title} fill className='object-cover' />
          </div>
        )}

        <dl className='border-border grid grid-cols-2 gap-x-6 gap-y-3 rounded-lg border p-4 text-sm'>
          {t.dateStart && (
            <>
              <dt className='text-muted-foreground font-medium'>Ngày bắt đầu</dt>
              <dd>{fmtDate(t.dateStart)}</dd>
            </>
          )}
          {t.dateEnd && t.dateEnd !== t.dateStart && (
            <>
              <dt className='text-muted-foreground font-medium'>Ngày kết thúc</dt>
              <dd>{fmtDate(t.dateEnd)}</dd>
            </>
          )}
          {t.location && (
            <>
              <dt className='text-muted-foreground font-medium'>Địa điểm</dt>
              <dd>{t.location}</dd>
            </>
          )}
          {t.prizeInfo && (
            <>
              <dt className='text-muted-foreground font-medium'>Giải thưởng</dt>
              <dd>{t.prizeInfo}</dd>
            </>
          )}
        </dl>

        {t.description && (
          <div className='prose dark:prose-invert max-w-none'>
            <p>{t.description}</p>
          </div>
        )}
      </article>
    </AppShell>
  )
}
