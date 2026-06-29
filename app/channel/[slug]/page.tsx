import { AppShell, VideoGrid } from '@/components/app-shell'
import { VideoGridItem } from '@/components/video-grid-item'
import { getChannelBySlug } from '@/lib/queries/catalog'
import { getChannelVideos } from '@/lib/queries/videos'
import Image from 'next/image'
import { notFound } from 'next/navigation'

export default async function ChannelPage({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params
  const channel = await getChannelBySlug(slug)
  if (!channel) notFound()
  const videos = await getChannelVideos(slug)

  return (
    <AppShell>
      <div className='mb-6 flex items-center gap-4'>
        {channel.avatarUrl && (
          <Image src={channel.avatarUrl} alt={channel.name} width={80} height={80} className='h-20 w-20 rounded-full' />
        )}
        <div>
          <h1 className='text-2xl font-bold'>{channel.name}</h1>
          {channel.description && <p className='text-secondary-foreground text-sm'>{channel.description}</p>}
          <p className='text-secondary-foreground text-sm'>{videos.length} video</p>
        </div>
      </div>
      <VideoGrid>
        {videos.map((v) => (
          <VideoGridItem key={v.id} {...v} />
        ))}
      </VideoGrid>
    </AppShell>
  )
}
