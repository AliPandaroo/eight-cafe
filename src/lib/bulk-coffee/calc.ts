import { parseUnsignedNumber } from "@/lib/parse/number";

export type BulkCoffeeUnit = "grams" | "toman";

export function parseQuoteInput(value: string) {
  return parseUnsignedNumber(value, { allowDecimal: true, min: 0.0001 }) ?? 0;
}

export function quoteBulkCoffee(
  pricePerKg: number,
  unit: BulkCoffeeUnit,
  value: number,
) {
  if (!Number.isFinite(pricePerKg) || pricePerKg <= 0) {
    return null;
  }

  if (!Number.isFinite(value) || value <= 0) {
    return null;
  }

  if (unit === "grams") {
    return {
      grams: value,
      amount: Math.round((pricePerKg * value) / 1000),
    };
  }

  return {
    grams: Math.round((value / pricePerKg) * 1000 * 10) / 10,
    amount: Math.round(value),
  };
}
