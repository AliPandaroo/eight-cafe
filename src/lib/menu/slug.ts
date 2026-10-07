export function slugify(value: string) {
  const slug = value
    .trim()
    .toLowerCase()
    .replace(/\s+/g, "-")
    .replace(/[^\p{L}\p{N}-]+/gu, "")
    .replace(/-+/g, "-")
    .replace(/^-|-$/g, "");

  return slug;
}

export function uniqueSlug(base: string, existing: string[]) {
  const fallback = base || "item";
  if (!existing.includes(fallback)) {
    return fallback;
  }

  let index = 2;
  while (existing.includes(`${fallback}-${index}`)) {
    index += 1;
  }

  return `${fallback}-${index}`;
}
