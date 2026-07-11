import { useState } from "react";

/**
 * Thẻ KPI dùng chung cho Staff + Admin portal — một chuẩn duy nhất:
 * nhãn text-xs font-semibold muted, số text-xl font-semibold, icon 40px bo xl.
 * Nhận `icon` (node lucide, kèm `tone` màu nền) hoặc `iconSrc` (asset ảnh của team).
 * Nếu có `iconSrc` mà file thiếu/lỗi → tự quay về `icon`+`tone` (không vỡ ảnh).
 * `highlight` viền cảnh báo khi cần chú ý; `subtitle` là dòng phụ tùy chọn.
 */
export function KpiCard({ label, value, icon, iconSrc, tone, subtitle, highlight = false }) {
  const [imgOk, setImgOk] = useState(true);
  return (
    <article
      className={`flex items-center gap-3 rounded-2xl border bg-card p-4 ${
        highlight ? "border-warning/40" : "border-border"
      }`}
    >
      {iconSrc && imgOk ? (
        <img src={iconSrc} alt="" width={40} height={40} className="shrink-0 rounded-xl object-contain" onError={() => setImgOk(false)} />
      ) : (
        <span className={`grid h-10 w-10 shrink-0 place-items-center rounded-xl ${tone || "bg-primary-container text-primary"}`}>
          {icon}
        </span>
      )}
      <div className="min-w-0">
        <p className="text-xs font-semibold text-muted-foreground">{label}</p>
        <b className="mt-0.5 block text-xl font-semibold text-foreground">{value}</b>
        {subtitle}
      </div>
    </article>
  );
}
