import { Center } from "@/components/layout"
import { MenuView } from "@/components/menu/menu-view"
import { getPublicRole } from "@/lib/admin/session"
import { getPublicMenu } from "@/lib/menu/public"

export const dynamic = "force-dynamic"

export default async function Home() {
  const menu = await getPublicMenu()

  if (!menu.ok) {
    return (
      <Center className="min-h-full px-6">
        <p className="text-center text-[13px] text-text/80">
          بارگذاری منو ممکن نشد. دوباره تلاش کنید.
        </p>
      </Center>
    )
  }

  return <MenuView menu={menu.data} role={await getPublicRole()} />
}
