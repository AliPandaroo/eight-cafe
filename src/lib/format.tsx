import type { MenuItemRecord } from "@/types/menu"

const integerFormat = new Intl.NumberFormat("en-US", {
  maximumFractionDigits: 0,
  minimumFractionDigits: 0,
})

export function formatInteger(value: number) {
  if (!Number.isFinite(value)) {
    return String(value)
  }

  return integerFormat.format(value)
}

function formatAmount(price: string) {
  const amount = Number(price);

  if (!Number.isFinite(amount)) {
    return price;
  }

  return formatInteger(Math.ceil(amount));
}

export function formatMenuItemPrice(item: MenuItemRecord) {
  if (!item.isAvailable) {
    return "ناموجود"
  }

  if (item.priceMax && item.priceMax !== item.price) {
    return formatPriceRange(item.price, item.priceMax)
  }

  return formatPrice(item.price, item.compareAtPrice)
}

export function formatPriceRange(minPrice: string, maxPrice: string) {
  return (
    <span dir="ltr" className="inline-flex items-baseline gap-1 text-foreground">
      <span className="text-xs">تومن</span>
      <span className="text-xl font-bold">{formatAmount(maxPrice)}</span>
      <span className="text-sm">—</span>
      <span className="text-xl font-bold">{formatAmount(minPrice)}</span>
    </span>
  )
}

export function formatPrice(
  price: string,
  compareAtPrice?: string | null,
  amountClass = "text-foreground",
) {
  const amount = formatAmount(price);
  const compare =
    compareAtPrice && compareAtPrice !== price
      ? formatAmount(compareAtPrice)
      : null;

  return (
    <>
      {compare ? (
        <span className="mr-1 text-xs text-text/45 line-through">{compare}</span>
      ) : null}
      <span className={`${amountClass} text-xl font-bold`}>{amount}</span>{" "}
      <span className={`${amountClass} text-xs`}>تومن</span>
    </>
  );
}

/** Admin enters price in هزار تومن (e.g. 95 → 95,000 تومن). */
export function priceToAdminInput(price: string) {
  const amount = Number(price);

  if (!Number.isFinite(amount)) {
    return price;
  }

  return String(amount);
}

export function parseAdminNumber(value: string) {
  const amount = Number(String(value).replace(/[,\s]/g, ""));

  return Number.isFinite(amount) ? amount : Number.NaN;
}

export function adminInputToPrice(value: string) {
  const amount = parseAdminNumber(value);

  if (!Number.isFinite(amount)) {
    return value;
  }

  return String(amount);
}
