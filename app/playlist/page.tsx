import { AppShell, VideoGrid } from '@/components/app-shell'
import { VideoGridItem } from '@/components/video-grid-item'
import { getPlaylistVideos } from '@/lib/queries/videos'
import { notFound } from 'next/navigation'

export default async function PlaylistPage({ searchParams }: { searchParams: Promise<{ list?: string }> }) {
  const { list } = await searchParams
  if (!list) notFound()
  const playlist = await getPlaylistVideos(list)
  if (!playlist) notFound()

  return (
    <AppShell>
      <h1 className='mb-4 text-xl font-bold'>{playlist.name}</h1>
      <VideoGrid>
        {playlist.videos.map((v) => (
          <VideoGridItem key={v.id} {...v} />
        ))}
      </VideoGrid>
    </AppShell>
  )
}
