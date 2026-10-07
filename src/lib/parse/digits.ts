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

export function stripNumberNoise(value: string) {
  return toAsciiDigits(value)
    .trim()
    .replace(/[,\s٬]/g, "");
}
