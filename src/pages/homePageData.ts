export const HOMEPAGE_IMPACT_MULTIPLIER = 2.13;

export type HomepageImpactRpcRow = {
  month: string;
  documented_appointments: number | string;
  displayed_value: number | string;
};

export type HomepageImpactPoint = {
  month: string;
  monthLabel: string;
  documentedAppointments: number;
  displayedValue: number;
};

const exactNumberFormatter = new Intl.NumberFormat("en-US", {
  maximumFractionDigits: 0,
});

export function formatExactImpactValue(value: number) {
  return exactNumberFormatter.format(value);
}

export function formatHomepageImpactMonth(month: string) {
  const match = /^(\d{4})-(\d{2})-\d{2}$/.exec(month);
  if (!match) return month;

  const year = Number(match[1]);
  const monthIndex = Number(match[2]) - 1;
  return new Intl.DateTimeFormat("en-US", {
    month: "short",
    year: "numeric",
    timeZone: "UTC",
  }).format(new Date(Date.UTC(year, monthIndex, 1)));
}

export function normalizeHomepageImpactRows(
  rows: HomepageImpactRpcRow[] | null | undefined,
): HomepageImpactPoint[] {
  if (!rows) return [];

  return rows
    .map((row) => ({
      month: row.month,
      monthLabel: formatHomepageImpactMonth(row.month),
      documentedAppointments: Number(row.documented_appointments),
      displayedValue: Number(row.displayed_value),
    }))
    .filter(
      (row) =>
        /^\d{4}-\d{2}-\d{2}$/.test(row.month) &&
        Number.isFinite(row.documentedAppointments) &&
        Number.isFinite(row.displayedValue) &&
        row.documentedAppointments >= 0 &&
        row.displayedValue >= 0,
    )
    .sort((a, b) => a.month.localeCompare(b.month));
}
