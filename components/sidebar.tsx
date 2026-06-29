'use client'

import { Button } from '@/components/ui/button'
import { useSidebarContext } from '@/contexts/sidebar-context'
import type { Channel, Playlist } from '@/lib/queries/catalog'
import {
  ChevronDown,
  ChevronUp,
  Clapperboard,
  Clock,
  Film,
  Flame,
  Gamepad2,
  GraduationCap,
  History,
  Home,
  Library,
  Lightbulb,
  Music2,
  Newspaper,
  PlaySquare,
  Podcast,
  Radio,
  Repeat,
  Shirt,
  ShoppingBag,
  Trophy
} from 'lucide-react'
import Image from 'next/image'
import Link from 'next/link'
import React, { Children, ElementType, useState } from 'react'
import { PageHeaderFirstSection } from './page-header'
import { Separator } from './ui/separator'

export function Sidebar({
  playlists = [],
  subscriptions = []
}: {
  playlists?: Playlist[]
  subscriptions?: Channel[]
}) {
  const { isLargeOpen, isSmallOpen, close } = useSidebarContext()

  return (
    <>
      <aside
        className={`scrollbar-hidden sticky top-0 ml-1 flex flex-col overflow-y-auto ${isLargeOpen ? 'lg:hidden' : 'lg:flex'}`}
      >
        <SmallSidebarItem IconOrImgUrl={Home} href='/' title='Home' />
        <SmallSidebarItem IconOrImgUrl={Repeat} href='/shorts' title='Shorts' />
        <SmallSidebarItem IconOrImgUrl={Clapperboard} href='/subscriptions' title='Subscriptions' />
        <SmallSidebarItem IconOrImgUrl={Library} href='/library' title='Library' />
      </aside>
      {isSmallOpen && <div className='fixed inset-0 z-999 bg-black/50 lg:hidden' onClick={close} />}
      <aside
        className={`scrollbar-hidden absolute top-0 w-56 flex-col gap-2 overflow-y-auto px-2 pb-4 lg:sticky ${isLargeOpen ? 'lg:flex' : 'lg:hidden'} ${isSmallOpen ? 'z-999 flex max-h-screen bg-white' : 'hidden'}`}
      >
        <div className='bg-background sticky top-0 p-2 lg:hidden'>
          <PageHeaderFirstSection />
        </div>
        <LargeSidebarSection>
          <LargeSidebarItem isActive IconOrImgUrl={Home} href='/' title='Home' />
          <LargeSidebarItem IconOrImgUrl={GraduationCap} href='/learn' title='Học' />
          <LargeSidebarItem IconOrImgUrl={Clapperboard} href='/subscriptions' title='Subscriptions' />
        </LargeSidebarSection>
        <Separator className='my-1' />
        <LargeSidebarSection visibleItemCount={5}>
          <LargeSidebarItem IconOrImgUrl={Library} href='/library' title='Library' />
          <LargeSidebarItem IconOrImgUrl={History} href='/history' title='History' />
          <LargeSidebarItem IconOrImgUrl={PlaySquare} href='/your-videos' title='Your Videos' />
          <LargeSidebarItem IconOrImgUrl={Clock} href='/playlist?list=WL' title='Watch Later' />
          {playlists.map((playlist) => (
            <LargeSidebarItem
              key={playlist.id}
              IconOrImgUrl={PlaySquare}
              href={`/playlist?list=${playlist.slug}`}
              title={playlist.name}
            />
          ))}
        </LargeSidebarSection>
        <Separator className='my-1' />
        <LargeSidebarSection title='Subscriptions' visibleItemCount={3}>
          {subscriptions.map((subscription) => (
            <LargeSidebarItem
              key={subscription.id}
              IconOrImgUrl={subscription.avatarUrl ?? Clapperboard}
              href={`/channel/${subscription.slug}`}
              title={subscription.name}
            />
          ))}
        </LargeSidebarSection>
        <Separator className='my-1' />
        <LargeSidebarSection title='Explore'>
          <LargeSidebarItem IconOrImgUrl={Flame} title='Trending' href='/trending' />
          <LargeSidebarItem IconOrImgUrl={ShoppingBag} title='Shopping' href='/shopping' />
          <LargeSidebarItem IconOrImgUrl={Music2} title='Music' href='/music' />
          <LargeSidebarItem IconOrImgUrl={Film} title='Movies & TV' href='/movies-tv' />
          <LargeSidebarItem IconOrImgUrl={Radio} title='Live' href='/live' />
          <LargeSidebarItem IconOrImgUrl={Gamepad2} title='Gaming' href='/gaming' />
          <LargeSidebarItem IconOrImgUrl={Newspaper} title='News' href='/news' />
          <LargeSidebarItem IconOrImgUrl={Trophy} title='Sports' href='/sports' />
          <LargeSidebarItem IconOrImgUrl={Lightbulb} title='Learning' href='/learning' />
          <LargeSidebarItem IconOrImgUrl={Shirt} title='Fashion & Beauty' href='/fashion-beauty' />
          <LargeSidebarItem IconOrImgUrl={Podcast} title='Podcasts' href='/podcasts' />
        </LargeSidebarSection>
      </aside>
    </>
  )
}

type SmallSidebarItemProps = {
  IconOrImgUrl: ElementType | string
  href: string
  title: string
}

function SmallSidebarItem({ IconOrImgUrl, href, title }: SmallSidebarItemProps) {
  return (
    <Button asChild variant='ghost' className='mb-2 rounded-sm px-4 py-8'>
      <Link href={href} className='flex flex-col items-center justify-center'>
        {typeof IconOrImgUrl === 'string' ? (
          <Image src={IconOrImgUrl} width={32} height={32} alt={title} className='rounded-full' />
        ) : (
          <IconOrImgUrl className='h-10 w-10' />
        )}
        <div className='text-xs'>{title}</div>
      </Link>
    </Button>
  )
}

type LargeSidebarSectionProps = {
  title?: string
  children: React.ReactNode
  visibleItemCount?: number
}

function LargeSidebarSection({
  children,
  title,
  visibleItemCount = Number.POSITIVE_INFINITY
}: LargeSidebarSectionProps) {
  const [isExpended, setIsExpended] = useState(false)
  const childrenArray = Children.toArray(children).flat()
  const showExpandButton = childrenArray.length > visibleItemCount
  const visibleChildren = isExpended ? childrenArray : childrenArray.slice(0, visibleItemCount)
  const ButtonIcon = isExpended ? ChevronUp : ChevronDown

  return (
    <div className='flex flex-col gap-1'>
      {title && <div className='ml-3 text-sm font-bold'>{title}</div>}
      {visibleChildren}
      {showExpandButton && (
        <Button variant='ghost' className='rounded-sm p-2' onClick={() => setIsExpended(!isExpended)}>
          <ButtonIcon className='h-6 w-6' />
          <div>{isExpended ? 'Show less' : 'Show more'}</div>
        </Button>
      )}
    </div>
  )
}

type LargeSidebarItemProps = {
  isActive?: boolean
  IconOrImgUrl: ElementType | string
  href: string
  title: string
}

function LargeSidebarItem({ isActive = false, IconOrImgUrl, href, title }: LargeSidebarItemProps) {
  return (
    <Button
      asChild
      variant='ghost'
      className={`hover:bg-accent-foreground hover:text-accent rounded-sm ${isActive ? 'bg-accent font-bold' : ''}`}
    >
      <Link href={href} className='flex w-full items-center justify-start'>
        {typeof IconOrImgUrl === 'string' ? (
          <Image src={IconOrImgUrl} width={32} height={32} alt={title} className='rounded-full' />
        ) : (
          <IconOrImgUrl className='h-10 w-10' />
        )}
        <div className='overflow-hidden text-sm text-ellipsis whitespace-nowrap'>{title}</div>
      </Link>
    </Button>
  )
}
