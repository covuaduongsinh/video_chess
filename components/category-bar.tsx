'use client'

import { CategoryPills } from '@/components/category-pills'
import { useRouter } from 'next/navigation'
import type { Category } from '@/lib/queries/catalog'

export function CategoryBar({ categories, selected }: { categories: Category[]; selected: string }) {
  const router = useRouter()
  const labels = categories.map((c) => c.name)
  const selectedLabel = categories.find((c) => c.slug === selected)?.name ?? categories[0]?.name

  return (
    <CategoryPills
      categories={labels}
      selectedCategory={selectedLabel}
      onSelect={(label) => {
        const slug = categories.find((c) => c.name === label)?.slug ?? 'all'
        router.push(slug === 'all' ? '/' : `/?category=${slug}`)
      }}
    />
  )
}
