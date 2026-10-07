import { toAsciiDigits } from "@/lib/parse/digits";

export { toAsciiDigits };

export function parseTableNumber(value: string) {
  const trimmed = toAsciiDigits(value).trim();

  if (!trimmed || !/^\d+$/.test(trimmed)) {
    return null;
  }

  const table = Number(trimmed);

  if (!Number.isInteger(table) || table < 0 || table > 999) {
    return null;
  }

  return table;
}

export function formatTableLabel(tableLabel: string) {
  if (tableLabel === "0") {
    return "بیرون‌بر";
  }

  if (!tableLabel) {
    return "بدون میز";
  }

  return `میز ${tableLabel}`;
}
