import { BrainCircuit, ChevronRight } from "lucide-react";

/** AI Insight nổi bật. insights: [{ title, description, colorBg, colorText, icon }] */
export function AiInsightPanel({ insights = [] }) {
  return (
    <div className="rounded-2xl border border-border bg-card p-5 shadow-sm">
      <h3 className="mb-4 flex items-center gap-2 font-extrabold text-foreground">
        <BrainCircuit size={18} className="text-primary" /> AI Insight nổi bật
      </h3>
      <div className="space-y-3">
        {insights.length > 0 ? insights.map((it, i) => (
          <div key={i} className="group flex items-start gap-3 rounded-xl border border-border bg-surface/50 p-4 transition hover:bg-primary-container/40">
            <span className={`shrink-0 rounded-lg p-2 ${it.colorBg} ${it.colorText}`}>{it.icon}</span>
            <div className="min-w-0">
              <p className="text-xs font-bold text-foreground">{it.title}</p>
              <p className="mt-1 text-xs leading-relaxed text-muted-foreground">{it.description}</p>
              <button className="mt-2 flex items-center gap-0.5 text-xs font-bold text-primary group-hover:underline">
                Xem chi tiết <ChevronRight size={14} />
              </button>
            </div>
          </div>
        )) : (
          <p className="py-6 text-center text-xs text-neutral-muted">Chưa đủ dữ liệu để phân tích.</p>
        )}
      </div>
    </div>
  );
}
