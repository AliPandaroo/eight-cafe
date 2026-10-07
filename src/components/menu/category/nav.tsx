"use client";

import { LayoutGroup } from "framer-motion";

import { CategoryPills } from "@/components/menu/category/pills";
import { CoffeeFilterCheckbox } from "@/components/menu/category/coffee-filter";
import { useCategoryNav } from "@/components/menu/category/use-nav";

export function CategoryNav({
  categories,
  reveal = true,
  coffeeOnly = false,
}: {
  categories: { id: string; slug: string; name: string }[];
  reveal?: boolean;
  coffeeOnly?: boolean;
}) {
  const {
    pending,
    activeSlug,
    navRef,
    stripRef,
    scrollToCategory,
    setCoffeeOnly,
  } = useCategoryNav(categories, coffeeOnly);

  if (categories.length === 0 && !coffeeOnly) {
    return null;
  }

  return (
    <LayoutGroup>
      <nav
        ref={navRef}
        className="sticky top-0 z-10 border-b border-foreground/10 bg-background/95 px-4 backdrop-blur-sm md:px-8"
      >
        <div className="flex items-center gap-5 py-3">
          <CoffeeFilterCheckbox
            checked={coffeeOnly}
            pending={pending}
            onChange={setCoffeeOnly}
          />
          <div
            ref={stripRef}
            className="flex min-w-0 flex-1 scrollbar-none justify-start gap-5 overflow-x-auto [&::-webkit-scrollbar]:hidden"
          >
            <CategoryPills
              categories={categories}
              activeSlug={activeSlug}
              reveal={reveal}
              onSelect={scrollToCategory}
            />
          </div>
        </div>
      </nav>
    </LayoutGroup>
  );
}
