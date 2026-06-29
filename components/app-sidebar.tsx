import { Sidebar } from '@/components/sidebar'
import { getPlaylists, getSubscriptionChannels } from '@/lib/queries/catalog'

/** Server wrapper: fetch playlists + subscriptions rồi truyền vào Sidebar (client). */
export async function AppSidebar() {
  const [playlists, subscriptions] = await Promise.all([getPlaylists(), getSubscriptionChannels()])
  return <Sidebar playlists={playlists} subscriptions={subscriptions} />
}
