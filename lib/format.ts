const DAY_MS = 24 * 60 * 60 * 1000;

export interface ParsedSender {
  name: string;
  email: string;
}

/** Splits "Maria Ferraz <maria@lojaverde.com.br>" into name + email. */
export function parseSender(from: string): ParsedSender {
  const raw = (from || "").trim();
  const match = raw.match(/^(.*?)\s*<(.+)>$/);
  if (match) {
    const extractedName = match[1].trim().replace(/^"|"$/g, "");
    const extractedEmail = match[2].trim();
    const name = extractedName || extractedEmail;
    return { name, email: extractedEmail };
  }
  const cleanEmail = raw.replace(/^<|>$/g, "").trim();
  return { name: cleanEmail, email: cleanEmail };
}

/** First letter of the display name (or email), uppercased — used in avatars. */
export function initialFor(from: string): string {
  const { name } = parseSender(from);
  return (name[0] ?? "?").toUpperCase();
}

export function formatClock(date: Date): string {
  return new Intl.DateTimeFormat("pt-BR", {
    hour: "2-digit",
    minute: "2-digit",
  }).format(date);
}

/** e.g. "22 jul" — used for rows outside today/yesterday groupings. */
export function formatShortDate(date: Date): string {
  return new Intl.DateTimeFormat("pt-BR", {
    day: "2-digit",
    month: "short",
  })
    .format(date)
    .replace(".", "");
}

/** e.g. "29 jul 2026, 09:42" — used on the detail header. */
export function formatFullDateTime(date: Date): string {
  const datePart = new Intl.DateTimeFormat("pt-BR", {
    day: "2-digit",
    month: "short",
    year: "numeric",
  })
    .format(date)
    .replace(".", "");
  return `${datePart}, ${formatClock(date)}`;
}

const RELATIVE_UNITS: [Intl.RelativeTimeFormatUnit, number][] = [
  ["year", 365 * DAY_MS],
  ["month", 30 * DAY_MS],
  ["day", DAY_MS],
  ["hour", 60 * 60 * 1000],
  ["minute", 60 * 1000],
];

/** e.g. "há 3 horas" */
export function formatRelative(date: Date, now: Date = new Date()): string {
  const diff = date.getTime() - now.getTime();
  const rtf = new Intl.RelativeTimeFormat("pt-BR", { numeric: "auto" });

  for (const [unit, ms] of RELATIVE_UNITS) {
    const value = Math.round(diff / ms);
    if (Math.abs(value) >= 1) return rtf.format(value, unit);
  }
  return rtf.format(0, "minute");
}

function startOfDay(date: Date): number {
  return new Date(date.getFullYear(), date.getMonth(), date.getDate()).getTime();
}

/** "Hoje" / "Ontem" / "22 jul" — used both as a row timestamp and a group header. */
export function dayLabel(date: Date, now: Date = new Date()): string {
  const diffDays = Math.round((startOfDay(now) - startOfDay(date)) / DAY_MS);
  if (diffDays === 0) return "Hoje";
  if (diffDays === 1) return "Ontem";
  return formatShortDate(date);
}

/** Row timestamp: clock time for today, short date otherwise. */
export function listTimestamp(date: Date, now: Date = new Date()): string {
  const diffDays = Math.round((startOfDay(now) - startOfDay(date)) / DAY_MS);
  return diffDays === 0 ? formatClock(date) : formatShortDate(date);
}

export interface DayGroup<T> {
  label: string;
  items: T[];
}

/** Groups already-sorted-desc items into "Hoje" / "Ontem" / date buckets. */
export function groupByDay<T>(
  items: T[],
  getDate: (item: T) => Date,
  now: Date = new Date(),
): DayGroup<T>[] {
  const groups: DayGroup<T>[] = [];

  for (const item of items) {
    const label = dayLabel(getDate(item), now);
    const current = groups.at(-1);
    if (current && current.label === label) {
      current.items.push(item);
    } else {
      groups.push({ label, items: [item] });
    }
  }

  return groups;
}

/** "2,4 MB" — KB up to 1024 KB, then MB, pt-BR decimal comma. */
export function formatBytes(bytes: number): string {
  if (bytes < 1024) return `${bytes} B`;
  const kb = bytes / 1024;
  if (kb < 1024) return `${formatDecimal(kb)} KB`;
  return `${formatDecimal(kb / 1024)} MB`;
}

function formatDecimal(value: number): string {
  return new Intl.NumberFormat("pt-BR", { maximumFractionDigits: 1 }).format(
    value,
  );
}
