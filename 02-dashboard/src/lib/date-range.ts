export type DateFilter = "all" | "today" | "week" | "month";

const TZ = "Asia/Dubai";

/** Calendar Y-M-D parts in Asia/Dubai for an instant. */
function dubaiParts(d = new Date()) {
  const fmt = new Intl.DateTimeFormat("en-CA", {
    timeZone: TZ,
    year: "numeric",
    month: "2-digit",
    day: "2-digit",
  });
  const parts = fmt.formatToParts(d);
  const get = (t: string) => parts.find((p) => p.type === t)?.value ?? "00";
  return {
    year: Number(get("year")),
    month: Number(get("month")),
    day: Number(get("day")),
  };
}

/** 0 = Monday … 6 = Sunday in Asia/Dubai. */
function dubaiMondayOffset(d = new Date()): number {
  const wd = new Intl.DateTimeFormat("en-US", {
    timeZone: TZ,
    weekday: "short",
  }).format(d);
  const map: Record<string, number> = {
    Mon: 0,
    Tue: 1,
    Wed: 2,
    Thu: 3,
    Fri: 4,
    Sat: 5,
    Sun: 6,
  };
  return map[wd] ?? 0;
}

/** Dubai midnight as UTC ISO (Dubai is UTC+4, no DST). */
function dubaiMidnightUtcIso(year: number, month: number, day: number): string {
  return new Date(Date.UTC(year, month - 1, day, -4, 0, 0, 0)).toISOString();
}

function addCalendarDays(year: number, month: number, day: number, delta: number) {
  const t = new Date(Date.UTC(year, month - 1, day + delta));
  return {
    year: t.getUTCFullYear(),
    month: t.getUTCMonth() + 1,
    day: t.getUTCDate(),
  };
}

/**
 * Lower bound (inclusive) for created_at filters.
 * Returns null for "all".
 */
export function dateFilterGte(filter: DateFilter): string | null {
  if (filter === "all") return null;

  const { year, month, day } = dubaiParts();

  if (filter === "today") {
    return dubaiMidnightUtcIso(year, month, day);
  }

  if (filter === "week") {
    const start = addCalendarDays(year, month, day, -dubaiMondayOffset());
    return dubaiMidnightUtcIso(start.year, start.month, start.day);
  }

  return dubaiMidnightUtcIso(year, month, 1);
}

export function parseDateFilter(raw: string | undefined | null): DateFilter {
  if (raw === "today" || raw === "week" || raw === "month") return raw;
  return "all";
}
