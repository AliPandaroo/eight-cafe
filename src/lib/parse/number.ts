import { stripNumberNoise } from "@/lib/parse/digits";

const MAX_AMOUNT = 99_999_999_999;

export function parseUnsignedNumber(
  value: string,
  options: { allowDecimal?: boolean; min?: number } = {},
) {
  const allowDecimal = options.allowDecimal ?? false;
  const min = options.min ?? 0;
  const normalized = stripNumberNoise(value);

  if (
    !normalized ||
    !(allowDecimal ? /^\d+(\.\d+)?$/ : /^\d+$/).test(normalized)
  ) {
    return null;
  }

  const amount = Number(normalized);

  if (!Number.isFinite(amount) || amount < min || amount > MAX_AMOUNT) {
    return null;
  }

  return amount;
}
