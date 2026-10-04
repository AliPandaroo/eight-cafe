import { AdminNav } from "@/components/admin/admin-nav"
import { Flex, Stack } from "@/components/layout"
import { Logo } from "@/components/logo"
import { Button } from "@/components/ui/button"
import { logoutAdminAction } from "@/features/admin/auth-actions"
import { requireStaff } from "@/lib/admin/session"
import { getRestaurant } from "@/lib/db/restaurant"

export const dynamic = "force-dynamic"

export default async function AdminPanelLayout({
  children,
}: {
  children: React.ReactNode
}) {
  const session = await requireStaff()
  const restaurant = await getRestaurant()

  return (
    <Flex
      direction="col"
      className="min-h-[100dvh] md:flex-row"
      gap={6}
    >
      <aside className="border-b border-foreground/15 p-5 md:min-h-full md:w-56 md:border-b-0 md:border-l">
        <Stack gap={5}>
          <Stack gap={1}>
            <Logo size="mini" className="mx-auto mb-4" />
            <p className="font-brand text-lg font-semibold text-text">{restaurant.name}</p>
            <p className="text-[11px] text-text/70">
              {session.role === "manager" ? "مدیر" : "گارسون"}
            </p>
          </Stack>
          <AdminNav role={session.role} />
          <form action={logoutAdminAction}>
            <Button type="submit" variant="ghost" className="w-full">
              خروج
            </Button>
          </form>
        </Stack>
      </aside>
      <main className="min-w-0 flex-1 p-5 md:p-8">{children}</main>
    </Flex>
  )
}
