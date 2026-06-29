'use client'

import { Button } from '@/components/ui/button'
import { useSidebarContext } from '@/contexts/sidebar-context'
import type { Category, Channel, Playlist } from '@/lib/queries/catalog'
import {
  BookOpen,
  Brain,
  Castle,
  ChevronDown,
  ChevronUp,
  Clapperboard,
  Clock,
  Crown,
  GraduationCap,
  History,
  Home,
  Library,
  PlaySquare,
  Puzzle,
  Swords,
  Target,
  Trophy,
  Users,
  type LucideIcon
} from 'lucide-react'
import Image from 'next/image'
import Link from 'next/link'
import React, { Children, ElementType, useState } from 'react'
import { PageHeaderFirstSection } from './page-header'
import { Separator } from './ui/separator'

/** Bộ icon cờ vua xoay vòng cho danh mục (danh mục do admin tạo nên không cố định). */
const CATEGORY_ICONS: LucideIcon[] = [Swords, Puzzle, Crown, Castle, Target, BookOpen, Brain, Trophy]

export function Sidebar({
  playlists = [],
  subscriptions = [],
  categories = []
}: {
  playlists?: Playlist[]
  subscriptions?: Channel[]
  categories?: Category[]
}) {
  const { isLargeOpen, isSmallOpen, close } = useSidebarContext()

  return (
    <>
      <aside
        className={`scrollbar-hidden sticky top-0 ml-1 flex flex-col overflow-y-auto ${isLargeOpen ? 'lg:hidden' : 'lg:flex'}`}
      >
        <SmallSidebarItem IconOrImgUrl={Home} href='/' title='Trang chủ' />
        <SmallSidebarItem IconOrImgUrl={GraduationCap} href='/learn' title='Học' />
        <SmallSidebarItem comingSoon IconOrImgUrl={Library} href='#' title='Thư viện' />
        <SmallSidebarItem comingSoon IconOrImgUrl={History} href='#' title='Lịch sử' />
      </aside>
      {isSmallOpen && <div className='fixed inset-0 z-999 bg-black/50 lg:hidden' onClick={close} />}
      <aside
        className={`scrollbar-hidden absolute top-0 w-56 flex-col gap-2 overflow-y-auto px-2 pb-4 lg:sticky ${isLargeOpen ? 'lg:flex' : 'lg:hidden'} ${isSmallOpen ? 'z-999 flex max-h-screen bg-white' : 'hidden'}`}
      >
        <div className='bg-background sticky top-0 p-2 lg:hidden'>
          <PageHeaderFirstSection />
        </div>
        <LargeSidebarSection>
          <LargeSidebarItem isActive IconOrImgUrl={Home} href='/' title='Trang chủ' />
          <LargeSidebarItem IconOrImgUrl={GraduationCap} href='/learn' title='Học cờ' />
        </LargeSidebarSection>

        {categories.length > 0 && (
          <>
            <Separator className='my-1' />
            <LargeSidebarSection title='Thể loại' visibleItemCount={8}>
              {categories.map((category, i) => (
                <LargeSidebarItem
                  key={category.id}
                  IconOrImgUrl={CATEGORY_ICONS[i % CATEGORY_ICONS.length]}
                  href={`/?category=${category.slug}`}
                  title={category.name}
                />
              ))}
            </LargeSidebarSection>
          </>
        )}

        {playlists.length > 0 && (
          <>
            <Separator className='my-1' />
            <LargeSidebarSection title='Playlist' visibleItemCount={5}>
              {playlists.map((playlist) => (
                <LargeSidebarItem
                  key={playlist.id}
                  IconOrImgUrl={PlaySquare}
                  href={`/playlist?list=${playlist.slug}`}
                  title={playlist.name}
                />
              ))}
            </LargeSidebarSection>
          </>
        )}

        {subscriptions.length > 0 && (
          <>
            <Separator className='my-1' />
            <LargeSidebarSection title='Kênh' visibleItemCount={5}>
              {subscriptions.map((subscription) => (
                <LargeSidebarItem
                  key={subscription.id}
                  IconOrImgUrl={subscription.avatarUrl ?? Clapperboard}
                  href={`/channel/${subscription.slug}`}
                  title={subscription.name}
                />
              ))}
            </LargeSidebarSection>
          </>
        )}

        <Separator className='my-1' />
        <LargeSidebarSection title='Thư viện của bạn'>
          <LargeSidebarItem comingSoon IconOrImgUrl={Library} href='#' title='Thư viện' />
          <LargeSidebarItem comingSoon IconOrImgUrl={History} href='#' title='Lịch sử' />
          <LargeSidebarItem comingSoon IconOrImgUrl={PlaySquare} href='#' title='Video của bạn' />
          <LargeSidebarItem comingSoon IconOrImgUrl={Clock} href='#' title='Xem sau' />
          <LargeSidebarItem comingSoon IconOrImgUrl={Users} href='#' title='Kênh đăng ký' />
        </LargeSidebarSection>
      </aside>
    </>
  )
}

type SmallSidebarItemProps = {
  IconOrImgUrl: ElementType | string
  href: string
  title: string
  comingSoon?: boolean
}

function SmallSidebarItem({ IconOrImgUrl, href, title, comingSoon = false }: SmallSidebarItemProps) {
  const inner = (
    <>
      {typeof IconOrImgUrl === 'string' ? (
        <Image src={IconOrImgUrl} width={32} height={32} alt={title} className='rounded-full' />
      ) : (
        <IconOrImgUrl className='h-10 w-10' />
      )}
      <div className='text-xs'>{title}</div>
    </>
  )

  if (comingSoon) {
    return (
      <div
        aria-disabled='true'
        title='Sắp ra mắt'
        className='mb-2 flex cursor-default flex-col items-center justify-center rounded-sm px-4 py-8 opacity-50'
      >
        {inner}
      </div>
    )
  }

  return (
    <Button asChild variant='ghost' className='mb-2 rounded-sm px-4 py-8'>
      <Link href={href} className='flex flex-col items-center justify-center'>
        {inner}
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
          <div>{isExpended ? 'Thu gọn' : 'Hiện thêm'}</div>
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
  comingSoon?: boolean
}

function LargeSidebarItem({
  isActive = false,
  IconOrImgUrl,
  href,
  title,
  comingSoon = false
}: LargeSidebarItemProps) {
  const icon =
    typeof IconOrImgUrl === 'string' ? (
      <Image src={IconOrImgUrl} width={32} height={32} alt={title} className='rounded-full' />
    ) : (
      <IconOrImgUrl className='h-10 w-10' />
    )

  if (comingSoon) {
    return (
      <div
        aria-disabled='true'
        title='Sắp ra mắt'
        className='flex w-full cursor-default items-center justify-start gap-1 rounded-sm px-4 py-2 opacity-50'
      >
        {icon}
        <div className='flex flex-1 items-center justify-between gap-1 overflow-hidden'>
          <span className='truncate text-sm'>{title}</span>
          <span className='text-secondary-foreground text-[10px] whitespace-nowrap'>Sắp ra mắt</span>
        </div>
      </div>
    )
  }

  return (
    <Button
      asChild
      variant='ghost'
      className={`hover:bg-accent-foreground hover:text-accent rounded-sm ${isActive ? 'bg-accent font-bold' : ''}`}
    >
      <Link href={href} className='flex w-full items-center justify-start'>
        {icon}
        <div className='overflow-hidden text-sm text-ellipsis whitespace-nowrap'>{title}</div>
      </Link>
    </Button>
  )
}
