'use client'

import { Button } from '@/components/ui/button'
import { createClient } from '@/lib/supabase/client'
import Link from 'next/link'
import { useState } from 'react'

export default function RegisterPage() {
  const [displayName, setDisplayName] = useState('')
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [error, setError] = useState<string | null>(null)
  const [loading, setLoading] = useState(false)
  const [done, setDone] = useState(false)

  async function onSubmit(e: React.FormEvent) {
    e.preventDefault()
    if (password.length < 6) {
      setError('Mật khẩu phải có ít nhất 6 ký tự.')
      return
    }
    setLoading(true)
    setError(null)
    const supabase = createClient()
    const { error } = await supabase.auth.signUp({
      email,
      password,
      options: { data: { display_name: displayName } }
    })
    if (error) {
      setError(error.message)
      setLoading(false)
      return
    }
    setDone(true)
  }

  if (done) {
    return (
      <div className='border-border w-full max-w-sm space-y-4 rounded-lg border p-6 text-center'>
        <h1 className='text-xl font-bold'>Kiểm tra email!</h1>
        <p className='text-muted-foreground text-sm'>
          Chúng tôi đã gửi link xác nhận đến <strong>{email}</strong>. Vui lòng kiểm tra hộp thư và nhấn vào link để kích hoạt tài khoản.
        </p>
        <Button asChild variant='outline' className='w-full'>
          <Link href='/login'>Về trang đăng nhập</Link>
        </Button>
      </div>
    )
  }

  return (
    <form onSubmit={onSubmit} className='border-border w-full max-w-sm space-y-4 rounded-lg border p-6'>
      <div>
        <h1 className='text-xl font-bold'>Đăng ký học viên</h1>
        <p className='text-muted-foreground text-sm'>Tham gia cộng đồng Cờ vua Dương Sinh</p>
      </div>

      <div className='space-y-1'>
        <label className='text-sm font-medium' htmlFor='displayName'>
          Tên hiển thị
        </label>
        <input
          id='displayName'
          type='text'
          required
          autoComplete='name'
          value={displayName}
          onChange={(e) => setDisplayName(e.target.value)}
          className='border-border focus:border-primary w-full rounded-md border px-3 py-2 text-sm outline-none'
          placeholder='Nguyễn Văn A'
        />
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
          autoComplete='new-password'
          minLength={6}
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          className='border-border focus:border-primary w-full rounded-md border px-3 py-2 text-sm outline-none'
          placeholder='Tối thiểu 6 ký tự'
        />
      </div>

      {error && <p className='text-sm text-red-500'>{error}</p>}

      <Button type='submit' disabled={loading} className='w-full'>
        {loading ? 'Đang tạo tài khoản...' : 'Đăng ký'}
      </Button>

      <p className='text-muted-foreground text-center text-sm'>
        Đã có tài khoản?{' '}
        <Link href='/login' className='text-primary underline'>
          Đăng nhập
        </Link>
      </p>
    </form>
  )
}
