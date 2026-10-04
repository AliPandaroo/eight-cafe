import Image from "next/image";

import { cn } from "@/utils/classMerge";

export function ItemMedia({
  src,
  alt,
  variant,
  priority = false,
}: {
  src: string | null;
  alt: string;
  variant: "card" | "detail";
  priority?: boolean;
}) {
  const frame =
    variant === "detail"
      ? "aspect-[4/3] w-full rounded-(--radius)"
      : "aspect-square w-full rounded-(--radius) ring-1 ring-foreground/15 md:ring-0"

  if (!src) {
    return <div className={cn("bg-foreground/10", frame)} aria-hidden />;
  }

  return (
    <div className={cn("relative overflow-hidden bg-foreground/10", frame)}>
      <Image
        src={src}
        alt={alt}
        fill
        sizes={
          variant === "detail"
            ? "(max-width: 767px) 100vw, 420px"
            : "(max-width: 767px) 50vw, 280px"
        }
        priority={priority}
        className="object-cover"
      />
    </div>
  );
}
