import { ChevronLeft, ChevronRight } from "lucide-react";
import { cn } from "@/lib/utils";

/**
 * Reusable pagination control.
 *
 * Props:
 *   page        — current page (1-based)
 *   pageSize    — items per page (default 10)
 *   total       — total item count
 *   onPageChange(nextPage)
 *   onPageSizeChange(nextSize) — optional; renders a rows-per-page select when set
 *   pageSizeOptions — options for the select (default [5, 10, 20])
 *   className
 *
 * Renders "Đang xem 1–10 trên tổng X", prev/next, and numbered pages.
 * Safe when total is 0 (renders nothing).
 */
export default function Pagination({
  page = 1,
  pageSize = 10,
  total = 0,
  onPageChange,
  onPageSizeChange,
  pageSizeOptions = [5, 10, 20],
  className = "",
}) {
  const safeTotal = Number(total) || 0;
  const totalPages = Math.max(1, Math.ceil(safeTotal / pageSize));
  const current = Math.min(Math.max(1, page), totalPages);

  if (safeTotal === 0) return null;

  const from = (current - 1) * pageSize + 1;
  const to = Math.min(current * pageSize, safeTotal);

  // Build a compact page-number window (max 5 around current).
  const pages = [];
  const start = Math.max(1, current - 2);
  const end = Math.min(totalPages, start + 4);
  const realStart = Math.max(1, end - 4);
  for (let i = realStart; i <= end; i += 1) pages.push(i);

  const go = (p) => {
    if (p < 1 || p > totalPages || p === current) return;
    onPageChange?.(p);
  };

  return (
    <div
      className={cn(
        "flex flex-col items-center justify-between gap-3 border-t border-border px-4 py-3 sm:flex-row",
        className,
      )}
    >
      <div className="flex flex-wrap items-center gap-3">
        <p className="text-xs font-semibold text-muted-foreground">
          Đang xem <b className="text-ink-soft">{from}</b>–
          <b className="text-ink-soft">{to}</b> trên tổng{" "}
          <b className="text-ink-soft">{safeTotal}</b>
        </p>
        {onPageSizeChange && (
          <label className="flex items-center gap-1.5 text-xs font-semibold text-muted-foreground">
            Hiển thị
            <select
              value={pageSize}
              onChange={(e) => onPageSizeChange(Number(e.target.value))}
              className="h-8 rounded-lg border border-border bg-card px-2 text-xs font-bold text-foreground outline-none"
            >
              {pageSizeOptions.map((n) => (
                <option key={n} value={n}>{n}</option>
              ))}
            </select>
            dòng
          </label>
        )}
      </div>

      <div className="flex items-center gap-1">
        <button
          type="button"
          onClick={() => go(current - 1)}
          disabled={current === 1}
          aria-label="Trang trước"
          className="grid h-8 w-8 place-items-center rounded-lg border border-border text-muted-foreground transition hover:bg-surface disabled:cursor-not-allowed disabled:opacity-40"
        >
          <ChevronLeft size={16} />
        </button>

        {realStart > 1 && (
          <>
            <PageButton n={1} current={current} onClick={go} />
            <span className="px-1 text-neutral-muted">…</span>
          </>
        )}

        {pages.map((p) => (
          <PageButton key={p} n={p} current={current} onClick={go} />
        ))}

        {end < totalPages && (
          <>
            <span className="px-1 text-neutral-muted">…</span>
            <PageButton n={totalPages} current={current} onClick={go} />
          </>
        )}

        <button
          type="button"
          onClick={() => go(current + 1)}
          disabled={current === totalPages}
          aria-label="Trang sau"
          className="grid h-8 w-8 place-items-center rounded-lg border border-border text-muted-foreground transition hover:bg-surface disabled:cursor-not-allowed disabled:opacity-40"
        >
          <ChevronRight size={16} />
        </button>
      </div>
    </div>
  );
}

function PageButton({ n, current, onClick }) {
  const active = n === current;
  return (
    <button
      type="button"
      onClick={() => onClick(n)}
      aria-current={active ? "page" : undefined}
      className={cn(
        "h-8 min-w-8 rounded-lg px-2 text-xs font-bold transition",
        active
          ? "bg-primary text-white shadow-sm"
          : "border border-border text-muted-foreground hover:bg-surface",
      )}
    >
      {n}
    </button>
  );
}
