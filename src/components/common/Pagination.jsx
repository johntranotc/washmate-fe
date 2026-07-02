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
        "flex flex-col items-center justify-between gap-3 border-t border-slate-100 px-4 py-3 sm:flex-row",
        className,
      )}
    >
      <p className="text-xs font-semibold text-slate-500">
        Đang xem <b className="text-slate-700">{from}</b>–
        <b className="text-slate-700">{to}</b> trên tổng{" "}
        <b className="text-slate-700">{safeTotal}</b>
      </p>

      <div className="flex items-center gap-1">
        <button
          type="button"
          onClick={() => go(current - 1)}
          disabled={current === 1}
          aria-label="Trang trước"
          className="grid h-8 w-8 place-items-center rounded-lg border border-slate-200 text-slate-600 transition hover:bg-slate-50 disabled:cursor-not-allowed disabled:opacity-40"
        >
          <ChevronLeft size={16} />
        </button>

        {realStart > 1 && (
          <>
            <PageButton n={1} current={current} onClick={go} />
            <span className="px-1 text-slate-400">…</span>
          </>
        )}

        {pages.map((p) => (
          <PageButton key={p} n={p} current={current} onClick={go} />
        ))}

        {end < totalPages && (
          <>
            <span className="px-1 text-slate-400">…</span>
            <PageButton n={totalPages} current={current} onClick={go} />
          </>
        )}

        <button
          type="button"
          onClick={() => go(current + 1)}
          disabled={current === totalPages}
          aria-label="Trang sau"
          className="grid h-8 w-8 place-items-center rounded-lg border border-slate-200 text-slate-600 transition hover:bg-slate-50 disabled:cursor-not-allowed disabled:opacity-40"
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
          ? "bg-blue-600 text-white shadow-sm"
          : "border border-slate-200 text-slate-600 hover:bg-slate-50",
      )}
    >
      {n}
    </button>
  );
}
