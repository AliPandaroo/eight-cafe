import { cn } from "@/utils/classMerge";

const PUBLIC_SVGS = {
  logo: "/logo.svg",
} as const;

export type LogoName = keyof typeof PUBLIC_SVGS;
export type LogoSize = "mini" | "large";

const SIZE_CLASS: Record<LogoSize, string> = {
  mini: "h-5 w-20",
  large: "h-12 w-48",
};

export function Logo({
  name = "logo",
  src,
  size = "large",
  color = "#989898",
  className,
  alt = "8 | Eight",
}: {
  name?: LogoName;
  src?: string;
  size?: LogoSize;
  color?: string;
  className?: string;
  alt?: string;
}) {
  const href = src ?? PUBLIC_SVGS[name];

  return (
    <span
      role="img"
      aria-label={alt}
      className={cn("inline-block shrink-0", SIZE_CLASS[size], className)}
      style={{
        backgroundColor: color,
        maskImage: `url(${href})`,
        maskRepeat: "no-repeat",
        maskPosition: "center",
        maskSize: "contain",
        WebkitMaskImage: `url(${href})`,
        WebkitMaskRepeat: "no-repeat",
        WebkitMaskPosition: "center",
        WebkitMaskSize: "contain",
      }}
    />
  );
}
