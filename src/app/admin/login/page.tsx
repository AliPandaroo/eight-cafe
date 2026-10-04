import { redirect } from "next/navigation"

import { Center, Stack } from "@/components/layout"
import { LoginForm } from "@/components/admin/login-form"
import { Logo } from "@/components/logo"
import { getStaffSession, homeForRole } from "@/lib/admin/session"
import { RESTAURANT } from "@/lib/restaurant"

export default async function AdminLoginPage({
  searchParams,
}: {
  searchParams: Promise<{ role?: string }>
}) {
  const session = await getStaffSession()

  if (session) {
    redirect(homeForRole(session.role))
  }

  const { role } = await searchParams
  const defaultRole = role === "waiter" ? "waiter" : "manager"

  return (
    <Center className="h-dvh p-6">
      <Stack gap={4} className="w-full max-w-sm">
        <h1 className="font-brand text-2xl font-semibold mx-auto">
          {RESTAURANT.name}
        </h1>
        <p className="text-sm text-text/80">ورود به پنل مدیریت</p>
        <LoginForm defaultRole={defaultRole} />
        <Logo size="mini" className="mx-auto self-end" />
      </Stack>
    </Center>
  );
}
