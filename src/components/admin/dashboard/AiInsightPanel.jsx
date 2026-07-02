import { BrainCircuit, ChevronRight } from "lucide-react";

/** AI Insight nổi bật. insights: [{ title, description, colorBg, colorText, icon }] */
export function AiInsightPanel({ insights = [] }) {
  return (
    <div className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm">
      <h3 className="mb-4 flex items-center gap-2 font-extrabold text-slate-800">
        <BrainCircuit size={18} className="text-blue-600" /> AI Insight nổi bật
      </h3>
      <div className="space-y-3">
        {insights.length > 0 ? insights.map((it, i) => (
          <div key={i} className="group flex items-start gap-3 rounded-xl border border-slate-100 bg-slate-50/50 p-4 transition hover:bg-blue-50/40">
            <span className={`shrink-0 rounded-lg p-2 ${it.colorBg} ${it.colorText}`}>{it.icon}</span>
            <div className="min-w-0">
              <p className="text-xs font-bold text-slate-800">{it.title}</p>
              <p className="mt-1 text-[11px] leading-relaxed text-slate-500">{it.description}</p>
              <button className="mt-2 flex items-center gap-0.5 text-[11px] font-bold text-blue-600 group-hover:underline">
                Xem chi tiết <ChevronRight size={12} />
              </button>
            </div>
          </div>
        )) : (
          <p className="py-6 text-center text-xs text-slate-400">Chưa đủ dữ liệu để phân tích.</p>
        )}
      </div>
    </div>
  );
}
