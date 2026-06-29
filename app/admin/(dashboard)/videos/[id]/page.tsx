import { VideoForm } from '@/components/admin/video-form'
import { getAllChannels, getCategories } from '@/lib/queries/catalog'
import { getVideoById } from '@/lib/queries/videos'
import { notFound } from 'next/navigation'
import { updateVideo } from '../actions'

export default async function EditVideoPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params
  const [video, channels, categories] = await Promise.all([
    getVideoById(id),
    getAllChannels(),
    getCategories()
  ])
  if (!video) notFound()

  return (
    <div className='space-y-4'>
      <h1 className='text-2xl font-bold'>Sửa video</h1>
      <VideoForm action={updateVideo.bind(null, id)} channels={channels} categories={categories} video={video} />
    </div>
  )
}
