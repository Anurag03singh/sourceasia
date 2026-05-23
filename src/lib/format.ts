export const CITY_NAMES: Record<string, string> = {
  NYC: "New York",
  LON: "London",
  DXB: "Dubai",
  SIN: "Singapore",
  LAX: "Los Angeles",
  TYO: "Tokyo",
  PAR: "Paris",
  FRA: "Frankfurt",
};

export const ROUTES: Array<{ origin: string; destination: string }> = [
  { origin: "NYC", destination: "LON" },
  { origin: "LON", destination: "NYC" },
  { origin: "DXB", destination: "SIN" },
  { origin: "SIN", destination: "DXB" },
  { origin: "LAX", destination: "TYO" },
  { origin: "TYO", destination: "LAX" },
  { origin: "PAR", destination: "FRA" },
  { origin: "FRA", destination: "PAR" },
];

export const ALL_AIRPORTS = Array.from(
  new Set(ROUTES.flatMap((r) => [r.origin, r.destination])),
).sort();

export function formatCity(code: string) {
  return CITY_NAMES[code] ?? code;
}

export function formatDateTime(iso: string) {
  return new Date(iso).toLocaleString(undefined, {
    weekday: "short",
    month: "short",
    day: "numeric",
    hour: "2-digit",
    minute: "2-digit",
  });
}

export function formatTime(iso: string) {
  return new Date(iso).toLocaleTimeString(undefined, {
    hour: "2-digit",
    minute: "2-digit",
  });
}

export function formatDate(iso: string) {
  return new Date(iso).toLocaleDateString(undefined, {
    weekday: "short",
    month: "short",
    day: "numeric",
  });
}

export function formatDuration(start: string, end: string) {
  const ms = new Date(end).getTime() - new Date(start).getTime();
  const h = Math.floor(ms / 3_600_000);
  const m = Math.floor((ms % 3_600_000) / 60_000);
  return `${h}h ${m}m`;
}

export function formatPrice(n: number) {
  return new Intl.NumberFormat(undefined, { style: "currency", currency: "USD", maximumFractionDigits: 0 }).format(n);
}
