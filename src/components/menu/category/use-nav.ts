"use client";

import {
  useEffect,
  useRef,
  useState,
  useTransition,
  type MouseEvent,
} from "react";
import { useRouter } from "next/navigation";

import {
  activeSlugFromScroll,
  prefersReducedMotion,
} from "@/lib/menu/active-category";
import { hrefForCoffeeFilter } from "@/lib/menu/coffee-href";
import type { CategoryPill } from "@/components/menu/category/pills";

export function useCategoryNav(
  categories: CategoryPill[],
  coffeeOnly: boolean,
) {
  const router = useRouter();
  const [pending, startTransition] = useTransition();
  const [activeSlug, setActiveSlug] = useState(categories[0]?.slug ?? "");
  const navRef = useRef<HTMLElement>(null);
  const stripRef = useRef<HTMLDivElement>(null);
  const didMountCoffeeFilter = useRef(false);
  const skipPillFollow = useRef(false);
  const categoryKey = categories.map((category) => category.slug).join("|");

  function resetCategoryStrip() {
    skipPillFollow.current = true;
    stripRef.current?.scrollTo({ left: 0, behavior: "auto" });
  }

  useEffect(() => {
    const slugs = categoryKey.split("|").filter(Boolean);

    function syncActiveFromScroll() {
      const navBottom = navRef.current?.getBoundingClientRect().bottom ?? 56;
      const next = activeSlugFromScroll(slugs, navBottom);
      setActiveSlug((current) => (current === next ? current : next));
    }

    syncActiveFromScroll();
    window.addEventListener("scroll", syncActiveFromScroll, { passive: true });
    window.addEventListener("resize", syncActiveFromScroll);

    return () => {
      window.removeEventListener("scroll", syncActiveFromScroll);
      window.removeEventListener("resize", syncActiveFromScroll);
    };
  }, [categoryKey]);

  useEffect(() => {
    if (!didMountCoffeeFilter.current) {
      didMountCoffeeFilter.current = true;
      return;
    }

    window.scrollTo({ top: 0, left: 0, behavior: "auto" });
    setActiveSlug(categories[0]?.slug ?? "");
    resetCategoryStrip();
    requestAnimationFrame(() => {
      resetCategoryStrip();
      skipPillFollow.current = false;
    });
  }, [coffeeOnly]); // eslint-disable-line react-hooks/exhaustive-deps -- only jump when the filter toggles

  useEffect(() => {
    if (!activeSlug) {
      return;
    }

    const pill = navRef.current?.querySelector<HTMLElement>(
      `[data-category-slug="${CSS.escape(activeSlug)}"]`,
    );

    if (!pill) {
      return;
    }

    if (skipPillFollow.current) {
      stripRef.current?.scrollTo({ left: 0, behavior: "auto" });
      return;
    }

    pill.scrollIntoView({
      behavior: prefersReducedMotion() ? "auto" : "smooth",
      inline: "center",
      block: "nearest",
    });
  }, [activeSlug]);

  function scrollToCategory(
    event: MouseEvent<HTMLAnchorElement>,
    slug: string,
  ) {
    event.preventDefault();

    const section = document.getElementById(slug);

    if (!section) {
      return;
    }

    setActiveSlug(slug);
    section.scrollIntoView({
      behavior: prefersReducedMotion() ? "auto" : "smooth",
      block: "start",
    });
    history.replaceState(null, "", `#${slug}`);
  }

  function setCoffeeOnly(next: boolean) {
    const href = hrefForCoffeeFilter(next);
    history.replaceState(null, "", href);
    window.scrollTo({ top: 0, left: 0, behavior: "auto" });
    resetCategoryStrip();
    setActiveSlug(categories[0]?.slug ?? "");
    startTransition(() => {
      router.replace(href);
    });
  }

  return {
    pending,
    activeSlug,
    navRef,
    stripRef,
    scrollToCategory,
    setCoffeeOnly,
  };
}
