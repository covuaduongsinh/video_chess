import { AppSidebar } from '@/components/app-sidebar'
import { PageHeader } from '@/components/page-header'

/** Khung trang công khai dùng chung: header + sidebar + nội dung. */
export function AppShell({ children }: { children: React.ReactNode }) {
  return (
    <div className='flex max-h-screen flex-col'>
      <PageHeader />
      <div className='grid grid-flow-col overflow-auto'>
        <AppSidebar />
        <div className='overflow-x-hidden px-4 pb-6'>{children}</div>
      </div>
    </div>
  )
}

export function VideoGrid({ children }: { children: React.ReactNode }) {
  return (
    <div className='grid grid-cols-1 gap-4 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4'>{children}</div>
  )
}
