import { Button } from "@/components/ui/button";
import type { CategoryRecord } from "@/types/menu";

export function CategoryBadges({
  categories,
  value,
  onChange,
  allowAll = false,
}: {
  categories: CategoryRecord[];
  value: string;
  onChange: (id: string) => void;
  allowAll?: boolean;
}) {
  return (
    <div className="flex flex-wrap gap-1.5">
      {allowAll ? (
        <CategoryBadge
          label="همه دسته‌ها"
          active={!value}
          onClick={() => onChange("")}
        />
      ) : null}
      {categories.map((category) => (
        <CategoryBadge
          key={category.id}
          label={category.name}
          active={value === category.id}
          onClick={() => onChange(category.id)}
        />
      ))}
    </div>
  );
}

function CategoryBadge({
  label,
  active,
  onClick,
}: {
  label: string;
  active: boolean;
  onClick: () => void;
}) {
  return (
    <Button
      variant={active ? "primary" : "ghost"}
      className="rounded-full px-2.5 py-1 text-[11px]"
      onClick={onClick}
    >
      {label}
    </Button>
  );
}
