"use client";

import { useState, type ReactNode } from "react";
import { ChevronDown } from "lucide-react";

import { Button } from "@/components/ui/button";
import { cn } from "@/utils/classMerge";

type SectionId = "types" | "calc" | "sales";

const SECTIONS: {
  id: SectionId;
  title: string;
  description?: string;
}[] = [
  { id: "calc", title: "ماشین‌حساب فله" },
  { id: "sales", title: "فروش‌های این هفته" },
  {
    id: "types",
    title: "قهوه روز",
    description:
      "انواع موجود و قیمت کیلو را اینجا بگذارید. فقط نوع‌های موجود در ماشین‌حساب دیده می‌شوند.",
  },
];

export function BulkCoffeeSections({
  types,
  calculator,
  sales,
}: {
  types: ReactNode;
  calculator: ReactNode;
  sales: ReactNode;
}) {
  const [open, setOpen] = useState<SectionId | null>("calc");
  const panels: Record<SectionId, ReactNode> = {
    types,
    calc: calculator,
    sales,
  };

  return (
    <div className="flex w-full flex-col gap-2 md:grid md:grid-cols-2 md:gap-3">
      {SECTIONS.map((section) => {
        const isOpen = open === section.id;

        return (
          <div
            key={section.id}
            className={cn(
              "flex flex-col gap-2",
              section.id === "sales" && "md:col-span-2",
            )}
          >
            <Button
              variant={isOpen ? "primary" : "ghost"}
              className="w-full justify-between px-3 py-2 text-right md:hidden"
              aria-expanded={isOpen}
              aria-controls={`sales-panel-${section.id}`}
              onClick={() =>
                setOpen((current) =>
                  current === section.id ? null : section.id,
                )
              }
            >
              {section.title}
              <ChevronDown
                className={cn(
                  "size-4 shrink-0 transition-transform",
                  isOpen && "rotate-180",
                )}
              />
            </Button>
            <div
              id={`sales-panel-${section.id}`}
              className={cn(
                "rounded-(--radius) border border-foreground/15 p-3",
                section.id === "calc" && "h-fit md:max-w-xl",
                section.id !== "calc" && "max-w-5xl",
                !isOpen && "max-md:hidden",
              )}
            >
              <h2 className="mb-3 hidden text-sm font-semibold md:block">
                {section.title}
              </h2>
              {section.description ? (
                <p className="mb-3 text-[11px] text-text/55">
                  {section.description}
                </p>
              ) : null}
              {panels[section.id]}
            </div>
          </div>
        );
      })}
    </div>
  );
}
