import { formatDuration, postedAgo, viewCount } from '@/lib/utils'
import type { VideoCard } from '@/lib/queries/videos'
import Image from 'next/image'
import Link from 'next/link'

export function VideoGridItem({ id, title, channel, views, duration, publishedAt, thumbnailUrl }: VideoCard) {
  return (
    <div className='flex flex-col gap-2'>
      <Link href={`/watch?v=${id}`} className='relative aspect-video'>
        {thumbnailUrl ? (
          <Image
            src={thumbnailUrl}
            alt={title}
            className='block h-full w-full rounded-sm object-cover'
            width={226}
            height={128}
          />
        ) : (
          <div className='bg-secondary h-full w-full rounded-sm' />
        )}
        {duration != null && (
          <div className='bg-secondary-foreground text-secondary absolute right-2 bottom-2 rounded px-1 text-sm'>
            {formatDuration(duration)}
          </div>
        )}
      </Link>
      <div className='flex gap-2'>
        {channel && (
          <Link href={`/channel/${channel.slug}`} className='shrink-0'>
            {channel.avatarUrl ? (
              <Image
                src={channel.avatarUrl}
                alt={channel.name}
                width={32}
                height={32}
                className='h-8 w-8 rounded-full'
              />
            ) : (
              <div className='bg-secondary h-8 w-8 rounded-full' />
            )}
          </Link>
        )}
        <div className='flex flex-col'>
          <Link href={`/watch?v=${id}`} className='text-sm/tight font-bold'>
            {title}
          </Link>
          {channel && (
            <Link href={`/channel/${channel.slug}`} className='text-secondary-foreground text-xs'>
              {channel.name}
            </Link>
          )}
          <div className='text-secondary-foreground text-xs'>
            {viewCount(views)} Views &bull; {publishedAt ? postedAgo(new Date(publishedAt)) : ''}
          </div>
        </div>
      </div>
    </div>
  )
}
