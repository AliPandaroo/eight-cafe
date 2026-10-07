import { Flex } from "@/components/layout";

export function AdminStat({
  label,
  value,
  children,
}: {
  label: string;
  value: number;
  children?: React.ReactNode;
}) {
  return (
    <Flex
      direction="col"
      className="rounded-(--radius) border border-foreground/15 p-4 h-fit"
    >
      <p className="text-[11px] text-text/70">{label}</p>
      <p className="mt-2 text-2xl font-semibold">{value}</p>
      <div className="mt-auto mr-auto w-fit">{children}</div>
    </Flex>
  );
}
