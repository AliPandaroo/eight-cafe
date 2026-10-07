import { BrandMark } from "@/components/menu/brand-mark";
import { RESTAURANT } from "@/lib/restaurant";

export default function Loading() {
  return (
    <div className="flex min-h-dvh flex-col bg-background">
      <div className="flex min-h-0 flex-1 flex-col items-center justify-center gap-4 px-6">
        <BrandMark size="hero" />
        <h1 className="text-center font-brand text-[18px] font-normal text-text">
          {RESTAURANT.name}
        </h1>
      </div>
      <div dir="ltr" className="relative h-36 w-full overflow-hidden md:h-40">
        <div className="absolute inset-0 bg-foreground/12" />
        <span className="absolute top-1/2 left-7 z-10 -translate-y-1/2 text-[18px] font-medium text-foreground tabular-nums md:text-[22px]">
          0%
        </span>
      </div>
    </div>
  );
}
