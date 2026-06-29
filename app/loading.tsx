// Skeleton hiển thị trong khi trang chủ tải dữ liệu video (Suspense fallback).
export default function Loading() {
  return (
    <div className='px-4 py-6'>
      <div className='grid grid-cols-1 gap-4 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4'>
        {Array.from({ length: 8 }).map((_, i) => (
          <div key={i} className='animate-pulse'>
            <div className='bg-muted aspect-video w-full rounded-xl' />
            <div className='mt-3 flex gap-3'>
              <div className='bg-muted size-9 shrink-0 rounded-full' />
              <div className='flex-1 space-y-2'>
                <div className='bg-muted h-4 w-3/4 rounded' />
                <div className='bg-muted h-3 w-1/2 rounded' />
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  )
}
