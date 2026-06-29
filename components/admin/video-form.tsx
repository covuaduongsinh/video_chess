'use client'

import { Button } from '@/components/ui/button'
import type { Category, Channel } from '@/lib/queries/catalog'
import type { VideoDetail } from '@/lib/queries/videos'
import { useState } from 'react'

const PROVIDERS = [
  { value: 'bunny', label: 'Bunny Stream' },
  { value: 'cloudflare', label: 'Cloudflare Stream' },
  { value: 'youtube', label: 'YouTube' },
  { value: 'gdrive', label: 'Google Drive' },
  { value: 'onedrive', label: 'OneDrive' },
  { value: 'other', label: 'Khác (link trực tiếp)' }
]

const HINTS: Record<string, string> = {
  bunny: 'Nhập Video ID (GUID) vào "Source ID". Cấu hình Library ID & CDN ở biến môi trường.',
  cloudflare: 'Nhập Video UID vào "Source ID".',
  youtube: 'Dán link YouTube vào "Source URL" — hệ thống tự tách ID.',
  gdrive: 'Dán link chia sẻ Google Drive vào "Source URL" — tự tách fileId. Nhớ đặt quyền "Ai có link".',
  onedrive: 'Dán URL nhúng (embed) lấy từ OneDrive vào "Source URL".',
  other: 'Dán link file video trực tiếp (mp4...) vào "Source URL".'
}

const inputCls = 'border-border w-full rounded-md border px-3 py-2 text-sm outline-none focus:border-blue-500'
const labelCls = 'text-sm font-medium'

export function VideoForm({
  action,
  channels,
  categories,
  video
}: {
  action: (formData: FormData) => void
  channels: Channel[]
  categories: Category[]
  video?: VideoDetail
}) {
  const [provider, setProvider] = useState<string>(video?.provider ?? 'youtube')

  return (
    <form action={action} className='max-w-2xl space-y-4'>
      <div className='space-y-1'>
        <label className={labelCls} htmlFor='title'>
          Tiêu đề *
        </label>
        <input id='title' name='title' required defaultValue={video?.title ?? ''} className={inputCls} />
      </div>

      <div className='space-y-1'>
        <label className={labelCls} htmlFor='description'>
          Mô tả
        </label>
        <textarea id='description' name='description' rows={3} defaultValue={video?.description ?? ''} className={inputCls} />
      </div>

      <div className='grid grid-cols-2 gap-4'>
        <div className='space-y-1'>
          <label className={labelCls} htmlFor='provider'>
            Nguồn video *
          </label>
          <select
            id='provider'
            name='provider'
            value={provider}
            onChange={(e) => setProvider(e.target.value)}
            className={inputCls}
          >
            {PROVIDERS.map((p) => (
              <option key={p.value} value={p.value}>
                {p.label}
              </option>
            ))}
          </select>
        </div>
        <div className='space-y-1'>
          <label className={labelCls} htmlFor='status'>
            Trạng thái *
          </label>
          <select id='status' name='status' defaultValue={video?.status ?? 'draft'} className={inputCls}>
            <option value='draft'>Nháp</option>
            <option value='published'>Xuất bản</option>
            <option value='hidden'>Ẩn</option>
          </select>
        </div>
      </div>

      <p className='text-secondary-foreground text-xs'>{HINTS[provider]}</p>

      <div className='grid grid-cols-2 gap-4'>
        <div className='space-y-1'>
          <label className={labelCls} htmlFor='source_id'>
            Source ID
          </label>
          <input id='source_id' name='source_id' defaultValue={video?.sourceId ?? ''} className={inputCls} />
        </div>
        <div className='space-y-1'>
          <label className={labelCls} htmlFor='source_url'>
            Source URL
          </label>
          <input id='source_url' name='source_url' defaultValue={video?.sourceUrl ?? ''} className={inputCls} />
        </div>
      </div>

      <div className='grid grid-cols-2 gap-4'>
        <div className='space-y-1'>
          <label className={labelCls} htmlFor='playback_url'>
            Playback URL (HLS, tuỳ chọn)
          </label>
          <input id='playback_url' name='playback_url' defaultValue={video?.playbackUrl ?? ''} className={inputCls} />
        </div>
        <div className='space-y-1'>
          <label className={labelCls} htmlFor='thumbnail_url'>
            Thumbnail URL (tuỳ chọn)
          </label>
          <input id='thumbnail_url' name='thumbnail_url' defaultValue={video?.thumbnailUrl ?? ''} className={inputCls} />
        </div>
      </div>

      <div className='grid grid-cols-3 gap-4'>
        <div className='space-y-1'>
          <label className={labelCls} htmlFor='channel_id'>
            Kênh
          </label>
          <select id='channel_id' name='channel_id' defaultValue={video?.channelId ?? ''} className={inputCls}>
            <option value=''>— Không —</option>
            {channels.map((c) => (
              <option key={c.id} value={c.id}>
                {c.name}
              </option>
            ))}
          </select>
        </div>
        <div className='space-y-1'>
          <label className={labelCls} htmlFor='category_id'>
            Danh mục
          </label>
          <select id='category_id' name='category_id' defaultValue={video?.categoryId ?? ''} className={inputCls}>
            <option value=''>— Không —</option>
            {categories.map((c) => (
              <option key={c.id} value={c.id}>
                {c.name}
              </option>
            ))}
          </select>
        </div>
        <div className='space-y-1'>
          <label className={labelCls} htmlFor='duration'>
            Thời lượng (giây)
          </label>
          <input id='duration' name='duration' type='number' defaultValue={video?.duration ?? ''} className={inputCls} />
        </div>
      </div>

      <div className='flex gap-2'>
        <Button type='submit'>{video ? 'Lưu thay đổi' : 'Tạo video'}</Button>
      </div>
    </form>
  )
}
