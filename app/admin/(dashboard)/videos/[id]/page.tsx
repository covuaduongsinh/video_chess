import { VideoForm } from '@/components/admin/video-form'
import { Button } from '@/components/ui/button'
import { getAllChannels, getCategories } from '@/lib/queries/catalog'
import { getLinkedGameIds, getPgnGames, type PgnGameRow } from '@/lib/queries/learning'
import { getVideoById } from '@/lib/queries/videos'
import { notFound } from 'next/navigation'
import { linkGameToVideo, unlinkGameFromVideo, updateVideo } from '../actions'

function gameLabel(g: PgnGameRow) {
  const players = [g.white, g.black].filter(Boolean).join(' – ')
  const parts = [g.title, players || null, g.eco].filter(Boolean)
  return parts.join(' · ') || 'Ván cờ'
}

export default async function EditVideoPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params
  const [video, channels, categories, games, linkedIds] = await Promise.all([
    getVideoById(id),
    getAllChannels(),
    getCategories(),
    getPgnGames(),
    getLinkedGameIds(id)
  ])
  if (!video) notFound()

  const linkedSet = new Set(linkedIds)
  const linked = games.filter((g) => linkedSet.has(g.id))
  const available = games.filter((g) => !linkedSet.has(g.id))

  return (
    <div className='space-y-6'>
      <h1 className='text-2xl font-bold'>Sửa video</h1>
      <VideoForm action={updateVideo.bind(null, id)} channels={channels} categories={categories} video={video} />

      {/* Ván cờ liên quan (khám phá ngược) */}
      <section className='border-border max-w-3xl space-y-3 rounded-lg border p-4'>
        <h2 className='text-xl font-bold'>Ván cờ liên quan</h2>
        <p className='text-muted-foreground text-sm'>
          Gắn các ván cờ (PGN) để người xem mở trực tiếp trên bàn cờ tương tác ngay tại trang xem video.
        </p>

        {linked.length === 0 ? (
          <p className='text-muted-foreground text-sm'>Chưa gắn ván cờ nào.</p>
        ) : (
          <ul className='space-y-1'>
            {linked.map((g) => (
              <li key={g.id} className='flex items-center justify-between gap-2 text-sm'>
                <span>{gameLabel(g)}</span>
                <form action={unlinkGameFromVideo.bind(null, id, g.id)}>
                  <Button type='submit' size='sm' variant='destructive'>
                    Gỡ
                  </Button>
                </form>
              </li>
            ))}
          </ul>
        )}

        {available.length > 0 && (
          <form action={linkGameToVideo.bind(null, id)} className='flex flex-wrap items-end gap-2'>
            <div className='flex-1'>
              <label className='text-sm font-medium' htmlFor='pgn_game_id'>
                Thêm ván cờ
              </label>
              <select
                id='pgn_game_id'
                name='pgn_game_id'
                required
                className='border-border w-full rounded-md border px-3 py-2 text-sm'
              >
                {available.map((g) => (
                  <option key={g.id} value={g.id}>
                    {gameLabel(g)}
                  </option>
                ))}
              </select>
            </div>
            <Button type='submit' size='sm'>
              Gắn
            </Button>
          </form>
        )}
      </section>
    </div>
  )
}
