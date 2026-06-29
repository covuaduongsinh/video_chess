import { VideoForm } from '@/components/admin/video-form'
import { getAllChannels, getCategories } from '@/lib/queries/catalog'
import { createVideo } from '../actions'

export default async function NewVideoPage() {
  const [channels, categories] = await Promise.all([getAllChannels(), getCategories()])
  return (
    <div className='space-y-4'>
      <h1 className='text-2xl font-bold'>Thêm video</h1>
      <VideoForm action={createVideo} channels={channels} categories={categories} />
    </div>
  )
}
