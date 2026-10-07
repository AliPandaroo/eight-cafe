const TEHRAN = "Asia/Tehran";

const WEEKDAY_OFFSET: Record<string, number> = {
  Sat: 0,
  Sun: 1,
  Mon: 2,
  Tue: 3,
  Wed: 4,
  Thu: 5,
  Fri: 6,
};

function tehranYmd(date = new Date()) {
  return new Intl.DateTimeFormat("en-CA", {
    timeZone: TEHRAN,
    year: "numeric",
    month: "2-digit",
    day: "2-digit",
  }).format(date);
}

function tehranWeekday(date = new Date()) {
  return new Intl.DateTimeFormat("en-US", {
    timeZone: TEHRAN,
    weekday: "short",
  }).format(date);
}

function shiftYmd(ymd: string, days: number) {
  const next = new Date(`${ymd}T12:00:00.000+03:30`);
  next.setUTCDate(next.getUTCDate() + days);
  return tehranYmd(next);
}

function startIso(ymd: string) {
  return `${ymd}T00:00:00.000+03:30`;
}

export function currentDayRange(now = new Date()) {
  const today = tehranYmd(now);
  const tomorrow = shiftYmd(today, 1);

  return {
    from: startIso(today),
    to: startIso(tomorrow),
    label: "امروز",
  };
}

export function currentWeekRange(now = new Date()) {
  const today = tehranYmd(now);
  const offset = WEEKDAY_OFFSET[tehranWeekday(now)] ?? 0;
  const saturday = shiftYmd(today, -offset);
  const nextSaturday = shiftYmd(saturday, 7);

  return {
    from: startIso(saturday),
    to: startIso(nextSaturday),
    label: "این هفته",
  };
}

export function weekDayYmds(range: { from: string }) {
  const saturday = range.from.slice(0, 10);

  return Array.from({ length: 7 }, (_, index) => shiftYmd(saturday, index));
}

export function tehranTodayYmd(now = new Date()) {
  return tehranYmd(now);
}

const prefactorTimeFormat = new Intl.DateTimeFormat("fa-IR", {
  timeZone: TEHRAN,
  calendar: "persian",
  numberingSystem: "latn",
  month: "short",
  day: "numeric",
  hour: "2-digit",
  minute: "2-digit",
  hourCycle: "h23",
});

const prefactorWeekdayFormat = new Intl.DateTimeFormat("fa-IR", {
  timeZone: TEHRAN,
  calendar: "persian",
  numberingSystem: "latn",
  weekday: "long",
});

export function formatPrefactorTime(iso: string) {
  return prefactorTimeFormat.format(new Date(iso));
}

export function prefactorDayKey(iso: string) {
  return tehranYmd(new Date(iso));
}

export function formatPrefactorWeekday(iso: string) {
  return prefactorWeekdayFormat.format(new Date(iso));
}
