import { Box } from "@/components/layout"

export default function AdminRootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return <Box className="min-h-full">{children}</Box>
}
