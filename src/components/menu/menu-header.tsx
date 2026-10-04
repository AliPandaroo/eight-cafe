import { Stack } from "@/components/layout"
import { BrandMark } from "@/components/menu/brand-mark"

export function MenuHeader({ name }: { name: string }) {
  return (
    <header className="flex flex-col items-center justify-center gap-3 px-4 py-5 md:px-8 md:py-6">
      <BrandMark size="sm" />
      <Stack gap={1} className="items-center text-center">
        <h1 className="font-brand text-[18px] font-normal text-text">{name}</h1>
      </Stack>
    </header>
  )
}
