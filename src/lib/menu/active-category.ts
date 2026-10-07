export function activeSlugFromScroll(slugs: string[], navBottom: number) {
  const firstSection = slugs[0] ? document.getElementById(slugs[0]) : null;
  const scrollPad = firstSection
    ? Number.parseFloat(getComputedStyle(firstSection).scrollMarginTop) || 96
    : 96;
  const line = Math.max(navBottom + 8, scrollPad + 8);
  let next = slugs[0] ?? "";

  for (const slug of slugs) {
    const section = document.getElementById(slug);

    if (!section) {
      continue;
    }

    if (section.getBoundingClientRect().top <= line) {
      next = slug;
    }
  }

  const scrolledToEnd =
    window.innerHeight + window.scrollY >=
    document.documentElement.scrollHeight - 32;
  const last = slugs[slugs.length - 1];

  if (scrolledToEnd && last) {
    return last;
  }

  return next;
}

export function prefersReducedMotion() {
  return window.matchMedia("(prefers-reduced-motion: reduce)").matches;
}
