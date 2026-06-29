import { Sidebar } from '@/components/sidebar'
import { getCategories, getPlaylists, getSubscriptionChannels } from '@/lib/queries/catalog'

/** Server wrapper: fetch playlists + subscriptions + danh mục rồi truyền vào Sidebar (client). */
export async function AppSidebar() {
  const [playlists, subscriptions, categories] = await Promise.all([
    getPlaylists(),
    getSubscriptionChannels(),
    getCategories()
  ])
  return <Sidebar playlists={playlists} subscriptions={subscriptions} categories={categories} />
}
