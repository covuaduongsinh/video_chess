'use client'

import { Button } from '@/components/ui/button'
import { createClient } from '@/lib/supabase/client'
import { useRouter, useSearchParams } from 'next/navigation'
import { Suspense, useState } from 'react'

export default function AdminLoginPage() {
  return (
    <Suspense>
      <AdminLoginForm />
    </Suspense>
  )
}

function AdminLoginForm() {
  const router = useRouter()
  const searchParams = useSearchParams()
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [error, setError] = useState<string | null>(null)
  const [loading, setLoading] = useState(false)

  async function onSubmit(e: React.FormEvent) {
    e.preventDefault()
    setLoading(true)
    setError(null)
    const supabase = createClient()
    const { error } = await supabase.auth.signInWithPassword({ email, password })
    if (error) {
      setError('Email hoặc mật khẩu không đúng.')
      setLoading(false)
      return
    }
    router.push(searchParams.get('redirect') || '/admin')
    router.refresh()
  }

  return (
    <div className='flex min-h-screen items-center justify-center px-4'>
      <form onSubmit={onSubmit} className='border-border w-full max-w-sm space-y-4 rounded-lg border p-6'>
        <div>
          <h1 className='text-xl font-bold'>Đăng nhập quản trị</h1>
          <p className='text-secondary-foreground text-sm'>Cờ vua Dương Sinh — Vui trí tuệ</p>
        </div>
        <div className='space-y-1'>
          <label className='text-sm font-medium' htmlFor='email'>
            Email
          </label>
          <input
            id='email'
            type='email'
            required
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            className='border-border w-full rounded-md border px-3 py-2 text-sm outline-none focus:border-blue-500'
          />
        </div>
        <div className='space-y-1'>
          <label className='text-sm font-medium' htmlFor='password'>
            Mật khẩu
          </label>
          <input
            id='password'
            type='password'
            required
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            className='border-border w-full rounded-md border px-3 py-2 text-sm outline-none focus:border-blue-500'
          />
        </div>
        {error && <p className='text-sm text-red-500'>{error}</p>}
        <Button type='submit' disabled={loading} className='w-full'>
          {loading ? 'Đang đăng nhập...' : 'Đăng nhập'}
        </Button>
      </form>
    </div>
  )
}
