import { cn } from "@/utils/classMerge";

export function BrandMark({
  size = "md",
  className,
}: {
  size?: "sm" | "md" | "lg" | "hero";
  className?: string;
}) {
  const classes = {
    sm: "h-10 w-10 text-lg",
    md: "h-14 w-14 text-2xl",
    lg: "h-20 w-20 text-4xl",
    hero: "h-24 w-24 text-5xl md:h-28 md:w-28 md:text-6xl",
  }[size];

  return (
    <div
      className={cn(
        "flex items-center justify-center rounded-full bg-foreground text-ink",
        classes,
        className,
      )}
    >
      <span className="font-brand leading-none font-semibold">8</span>
    </div>
  );
}
