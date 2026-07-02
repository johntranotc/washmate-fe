// Shared formatting helpers for WashMate FE.
// Safe against null/undefined/NaN — always returns a displayable string.

const vndFormatter = new Intl.NumberFormat("vi-VN");

/**
 * Format a number as Vietnamese currency, e.g. 125680000 -> "125.680.000 đ".
 * Returns "0 đ" for null/undefined/NaN values.
 */
export function formatMoney(value) {
  const num = Number(value);
  return `${vndFormatter.format(Number.isFinite(num) ? num : 0)} đ`;
}

/** Compact money for chart axes/labels, e.g. 125680000 -> "125,7 Tr". */
export function formatMoneyCompact(value) {
  const num = Number(value);
  return new Intl.NumberFormat("vi-VN", {
    notation: "compact",
    compactDisplay: "short",
    maximumFractionDigits: 1,
  }).format(Number.isFinite(num) ? num : 0);
}

/** Plain grouped number, e.g. 126450 -> "126.450". */
export function formatNumber(value) {
  const num = Number(value);
  return vndFormatter.format(Number.isFinite(num) ? num : 0);
}

/**
 * Format a date-like value to "dd/MM/yyyy".
 * Accepts Date, ISO string, or "yyyy-MM-dd". Returns "—" when empty/invalid.
 */
export function formatDate(value) {
  if (!value) return "—";
  const d = value instanceof Date ? value : new Date(value);
  if (Number.isNaN(d.getTime())) {
    // Try "yyyy-MM-dd" plain string fallback
    if (typeof value === "string" && /^\d{4}-\d{2}-\d{2}/.test(value)) {
      const [y, m, day] = value.slice(0, 10).split("-");
      return `${day}/${m}/${y}`;
    }
    return String(value);
  }
  return d.toLocaleDateString("vi-VN");
}

/** Format a date-like value to "HH:mm dd/MM/yyyy". Returns "—" when empty/invalid. */
export function formatDateTime(value) {
  if (!value) return "—";
  const d = value instanceof Date ? value : new Date(value);
  if (Number.isNaN(d.getTime())) return String(value);
  return d.toLocaleString("vi-VN", {
    hour: "2-digit",
    minute: "2-digit",
    day: "2-digit",
    month: "2-digit",
    year: "numeric",
  });
}

/** Format a "HH:mm:ss" / "HH:mm" time string to "HH:mm". */
export function formatTime(value) {
  if (!value) return "";
  return String(value).slice(0, 5);
}

/** Today's date as "yyyy-MM-dd" (local time). */
export function todayISO() {
  const d = new Date();
  return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, "0")}-${String(
    d.getDate(),
  ).padStart(2, "0")}`;
}
