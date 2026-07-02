import { BrainCircuit, ChevronRight, AlertTriangle, Clock, TrendingDown, UserX, AlertCircle } from "lucide-react";

export function AiInsightAndAlerts({ insights = [], alerts = [] }) {
  return (
    <div className="space-y-6">
      {/* AI Insight */}
      <div className="bg-white rounded-2xl border border-slate-200 p-5 shadow-sm">
        <h3 className="font-extrabold text-slate-800 mb-4 flex items-center gap-2">
          <BrainCircuit size={18} className="text-blue-600" />
          AI Insight
        </h3>
        <div className="space-y-3">
          {insights.length > 0 ? insights.map((insight, idx) => (
            <div key={idx} className="bg-slate-50/50 rounded-xl p-4 border border-slate-100 flex items-start gap-3 transition-colors hover:bg-blue-50/30 group">
              <div className={`p-2 rounded-lg shrink-0 ${insight.colorBg} ${insight.colorText}`}>
                {insight.icon}
              </div>
              <div>
                <p className="text-xs font-bold text-slate-800">{insight.title}</p>
                <p className="text-[10px] text-slate-500 mt-1 leading-relaxed">{insight.description}</p>
                <button className="text-[10px] font-bold text-blue-600 mt-2 flex items-center gap-0.5 group-hover:underline">
                  Xem chi tiết <ChevronRight size={12} />
                </button>
              </div>
            </div>
          )) : (
            <div className="py-6 text-center text-xs text-slate-400">Chưa có dữ liệu phân tích hành vi.</div>
          )}
        </div>
        <button className="text-xs font-bold text-blue-600 hover:underline mt-4 w-full text-left flex justify-between items-center">
          Xem tất cả insight <ChevronRight size={14} />
        </button>
      </div>

      {/* Thông báo & Cảnh báo */}
      <div className="bg-white rounded-2xl border border-slate-200 p-5 shadow-sm">
        <h3 className="font-extrabold text-slate-800 mb-4 flex items-center gap-2">
          <AlertCircle size={18} className="text-blue-600" />
          Thông báo & Cảnh báo
        </h3>
        <div className="space-y-3">
          {alerts.length > 0 ? alerts.map((alert, idx) => (
            <div key={idx} className="flex items-start gap-3 py-2 border-b border-slate-50 last:border-0">
              <div className={`mt-0.5 shrink-0 ${alert.colorText}`}>
                {alert.icon}
              </div>
              <div>
                <p className="text-[11px] font-bold text-slate-800">{alert.title}</p>
                <p className="text-[10px] text-slate-500 mt-0.5">{alert.description}</p>
              </div>
            </div>
          )) : (
            <div className="py-6 text-center text-xs text-slate-400">Không có cảnh báo nào.</div>
          )}
        </div>
        <button className="text-xs font-bold text-blue-600 hover:underline mt-4 w-full text-left flex justify-between items-center">
          Xem tất cả thông báo <ChevronRight size={14} />
        </button>
      </div>
    </div>
  );
}
