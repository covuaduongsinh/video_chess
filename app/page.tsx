import { AppSidebar } from '@/components/app-sidebar'
import { CategoryBar } from '@/components/category-bar'
import { PageHeader } from '@/components/page-header'
import { VideoGridItem } from '@/components/video-grid-item'
import { getCategories } from '@/lib/queries/catalog'
import { getPublishedVideos } from '@/lib/queries/videos'

export default async function Home({ searchParams }: { searchParams: Promise<{ category?: string }> }) {
  const { category } = await searchParams
  const selected = category ?? 'all'

  const [categories, videos] = await Promise.all([getCategories(), getPublishedVideos(selected)])
  const pills = [{ id: 'all', name: 'All', slug: 'all' }, ...categories]

  return (
    <div className='flex max-h-screen flex-col'>
      <PageHeader />
      <div className='grid grid-flow-col overflow-auto'>
        <AppSidebar />
        <div className='overflow-x-hidden px-2 pb-4'>
          <div className='bg-background sticky top-0 z-10 pb-4'>
            <CategoryBar categories={pills} selected={selected} />
          </div>
          {videos.length === 0 ? (
            <p className='text-secondary-foreground py-10 text-center text-sm'>Chưa có video nào.</p>
          ) : (
            <div className='grid grid-cols-1 gap-4 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4'>
              {videos.map((video) => (
                <VideoGridItem key={video.id} {...video} />
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  )
}
