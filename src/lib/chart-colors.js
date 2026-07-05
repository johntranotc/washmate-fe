/**
 * Mirror --chart-* trong src/index.css — Recharts cần chuỗi màu cụ thể,
 * không đọc được CSS variable. Đây là file DUY NHẤT được phép chứa hex
 * trong src ngoài index.css. Sync 2 chiều với DESIGN.md.
 */
export const CHART = {
  c1: "#2563eb",
  c2: "#f59e0b",
  c3: "#8b5cf6",
  c4: "#10b981",
  c5: "#64748b",
  grid: "#e2e8f0",
  axis: "#64748b",
  ink: "#0f172a", // tooltip label — mirror --foreground
  contrast: "#ffffff", // viền dot trên line màu — mirror --background
  compare: "#94a3b8", // đường so sánh kỳ trước (dashed) — mirror --neutral-muted
  critical: "#ef4444", // series lỗi/hủy trong chart nhiều series
  cyan: "#06b6d4", // series mở rộng khi 5 màu chart không đủ
  orange: "#f97316", // series no-show trong chart
};

/** Màu trạng thái booking dùng trong chart/legend (donut, bar, progress). */
export const STATUS_COLORS = {
  PENDING: CHART.c2,
  CONFIRMED: CHART.c1,
  CHECKED_IN: CHART.cyan,
  WASHING: CHART.c3,
  COMPLETED: CHART.c4,
  CANCELLED: CHART.compare,
  REJECTED: CHART.critical,
  NO_SHOW: CHART.orange,
};
