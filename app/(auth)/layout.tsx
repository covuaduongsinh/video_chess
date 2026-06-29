import Link from 'next/link'

export default function AuthLayout({ children }: { children: React.ReactNode }) {
  return (
    <div className='flex min-h-screen flex-col'>
      <header className='border-border border-b px-4 py-3'>
        <Link href='/' className='flex items-baseline gap-1.5'>
          <span className='text-primary font-bold'>Cờ vua Dương Sinh</span>
          <span className='text-brand-gold text-xs font-medium'>Vui trí tuệ</span>
        </Link>
      </header>
      <main className='flex flex-1 items-center justify-center px-4 py-8'>{children}</main>
    </div>
  )
}
