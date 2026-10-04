"use client"

import { useEffect, useRef, useState, type MouseEvent } from "react"
import { LayoutGroup, motion } from "framer-motion"

import { cn } from "@/utils/classMerge"

export function CategoryNav({
  categories,
  reveal = true,
}: {
  categories: { id: string; slug: string; name: string }[]
  reveal?: boolean
}) {
  const [activeSlug, setActiveSlug] = useState(categories[0]?.slug ?? "")
  const navRef = useRef<HTMLElement>(null)
  const categoryKey = categories.map((category) => category.slug).join("|")

  useEffect(() => {
    const slugs = categoryKey.split("|").filter(Boolean)

    function syncActiveFromScroll() {
      const navBottom = navRef.current?.getBoundingClientRect().bottom ?? 56
      const firstSection = slugs[0] ? document.getElementById(slugs[0]) : null
      const scrollPad = firstSection
        ? Number.parseFloat(getComputedStyle(firstSection).scrollMarginTop) || 96
        : 96
      const line = Math.max(navBottom + 8, scrollPad + 8)
      let next = slugs[0] ?? ""

      for (const slug of slugs) {
        const section = document.getElementById(slug)
        if (!section) {
          continue
        }

        if (section.getBoundingClientRect().top <= line) {
          next = slug
        }
      }

      const scrolledToEnd =
        window.innerHeight + window.scrollY >=
        document.documentElement.scrollHeight - 32
      const last = slugs[slugs.length - 1]
      if (scrolledToEnd && last) {
        next = last
      }

      setActiveSlug((current) => (current === next ? current : next))
    }

    syncActiveFromScroll()
    window.addEventListener("scroll", syncActiveFromScroll, { passive: true })
    window.addEventListener("resize", syncActiveFromScroll)

    return () => {
      window.removeEventListener("scroll", syncActiveFromScroll)
      window.removeEventListener("resize", syncActiveFromScroll)
    }
  }, [categoryKey])

  useEffect(() => {
    if (!activeSlug) {
      return
    }

    const pill = navRef.current?.querySelector<HTMLElement>(
      `[data-category-slug="${CSS.escape(activeSlug)}"]`,
    )

    if (!pill) {
      return
    }

    pill.scrollIntoView({
      behavior: window.matchMedia("(prefers-reduced-motion: reduce)").matches
        ? "auto"
        : "smooth",
      inline: "center",
      block: "nearest",
    })
  }, [activeSlug])

  function scrollToCategory(
    event: MouseEvent<HTMLAnchorElement>,
    slug: string,
  ) {
    event.preventDefault()

    const section = document.getElementById(slug)

    if (!section) {
      return
    }

    const reduceMotion = window.matchMedia(
      "(prefers-reduced-motion: reduce)",
    ).matches

    setActiveSlug(slug)
    section.scrollIntoView({
      behavior: reduceMotion ? "auto" : "smooth",
      block: "start",
    })
    history.replaceState(null, "", `#${slug}`)
  }

  if (categories.length === 0) {
    return null
  }

  return (
    <LayoutGroup>
      <nav
        ref={navRef}
        className="sticky top-0 z-10 border-b border-foreground/10 bg-background/95 px-4 backdrop-blur-sm md:px-8"
      >
        <div className="flex gap-5 overflow-x-auto py-3 md:justify-center [scrollbar-width:none] [&::-webkit-scrollbar]:hidden">
          {categories.map((category, index) => {
            const active = category.slug === activeSlug

            return (
              <motion.a
                key={category.id}
                href={`#${category.slug}`}
                data-category-slug={category.slug}
                onClick={(event) => scrollToCategory(event, category.slug)}
                initial={reveal ? { opacity: 0, y: 14 } : false}
                animate={{ opacity: 1, y: 0 }}
                transition={{
                  delay: reveal ? 0.08 + index * 0.11 : 0,
                  duration: 0.38,
                  ease: [0.22, 1, 0.36, 1],
                }}
                className={cn(
                  "relative shrink-0 rounded-[var(--radius)] px-3 py-1.5 text-[13px] whitespace-nowrap",
                  active ? "text-ink" : "text-text/55",
                )}
              >
                {active ? (
                  <motion.span
                    layoutId="active-category"
                    className="absolute inset-0 rounded-[var(--radius)] bg-foreground"
                    transition={{ type: "spring", stiffness: 420, damping: 32 }}
                  />
                ) : null}
                <span className="relative z-10">{category.name}</span>
              </motion.a>
            )
          })}
        </div>
      </nav>
    </LayoutGroup>
  )
}
