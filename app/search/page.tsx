import { AppShell, VideoGrid } from '@/components/app-shell'
import { VideoGridItem } from '@/components/video-grid-item'
import { searchVideos } from '@/lib/queries/videos'

export default async function SearchPage({ searchParams }: { searchParams: Promise<{ q?: string }> }) {
  const { q } = await searchParams
  const query = (q ?? '').trim()
  const videos = query ? await searchVideos(query) : []

  return (
    <AppShell>
      <h1 className='mb-4 text-xl font-bold'>
        {query ? `Kết quả cho “${query}” (${videos.length})` : 'Nhập từ khoá để tìm kiếm'}
      </h1>
      {query && videos.length === 0 ? (
        <p className='text-secondary-foreground'>Không tìm thấy video nào.</p>
      ) : (
        <VideoGrid>
          {videos.map((v) => (
            <VideoGridItem key={v.id} {...v} />
          ))}
        </VideoGrid>
      )}
    </AppShell>
  )
}
