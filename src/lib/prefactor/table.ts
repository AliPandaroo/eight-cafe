const FA_DIGITS = "۰۱۲۳۴۵۶۷۸۹";
const AR_DIGITS = "٠١٢٣٤٥٦٧٨٩";

export function toAsciiDigits(value: string) {
  return value.replace(/[۰-۹٠-٩]/g, (digit) => {
    const fa = FA_DIGITS.indexOf(digit);
    if (fa >= 0) {
      return String(fa);
    }

    const ar = AR_DIGITS.indexOf(digit);
    return ar >= 0 ? String(ar) : digit;
  });
}

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
