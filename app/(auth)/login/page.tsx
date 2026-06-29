'use client'

import { Button } from '@/components/ui/button'
import { createClient } from '@/lib/supabase/client'
import Link from 'next/link'
import { useRouter, useSearchParams } from 'next/navigation'
import { Suspense, useState } from 'react'

export default function LoginPage() {
  return (
    <Suspense>
      <LoginForm />
    </Suspense>
  )
}

function LoginForm() {
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
    router.push(searchParams.get('redirect') ?? '/')
    router.refresh()
  }

  return (
    <form onSubmit={onSubmit} className='border-border w-full max-w-sm space-y-4 rounded-lg border p-6'>
      <div>
        <h1 className='text-xl font-bold'>Đăng nhập</h1>
        <p className='text-muted-foreground text-sm'>Chào mừng trở lại!</p>
      </div>

      <div className='space-y-1'>
        <label className='text-sm font-medium' htmlFor='email'>
          Email
        </label>
        <input
          id='email'
          type='email'
          required
          autoComplete='email'
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          className='border-border focus:border-primary w-full rounded-md border px-3 py-2 text-sm outline-none'
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
          autoComplete='current-password'
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          className='border-border focus:border-primary w-full rounded-md border px-3 py-2 text-sm outline-none'
        />
      </div>

      {error && <p className='text-sm text-red-500'>{error}</p>}

      <Button type='submit' disabled={loading} className='w-full'>
        {loading ? 'Đang đăng nhập...' : 'Đăng nhập'}
      </Button>

      <p className='text-muted-foreground text-center text-sm'>
        Chưa có tài khoản?{' '}
        <Link href='/register' className='text-primary underline'>
          Đăng ký
        </Link>
      </p>
    </form>
  )
}
