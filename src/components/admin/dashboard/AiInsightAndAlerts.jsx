import { BrainCircuit, ChevronRight, AlertTriangle, Clock, TrendingDown, UserX, AlertCircle } from "lucide-react";

export function AiInsightAndAlerts({ insights = [], alerts = [] }) {
  return (
    <div className="space-y-6">
      {/* AI Insight */}
      <div className="bg-card rounded-2xl border border-border p-5 shadow-sm">
        <h3 className="font-extrabold text-foreground mb-4 flex items-center gap-2">
          <BrainCircuit size={18} className="text-primary" />
          AI Insight
        </h3>
        <div className="space-y-3">
          {insights.length > 0 ? insights.map((insight, idx) => (
            <div key={idx} className="bg-surface/50 rounded-xl p-4 border border-border flex items-start gap-3 transition-colors hover:bg-primary-container/30 group">
              <div className={`p-2 rounded-lg shrink-0 ${insight.colorBg} ${insight.colorText}`}>
                {insight.icon}
              </div>
              <div>
                <p className="text-xs font-bold text-foreground">{insight.title}</p>
                <p className="text-xs text-muted-foreground mt-1 leading-relaxed">{insight.description}</p>
                <button className="text-xs font-bold text-primary mt-2 flex items-center gap-0.5 group-hover:underline">
                  Xem chi tiết <ChevronRight size={14} />
                </button>
              </div>
            </div>
          )) : (
            <div className="py-6 text-center text-xs text-neutral-muted">Chưa có dữ liệu phân tích hành vi.</div>
          )}
        </div>
        <button className="text-xs font-bold text-primary hover:underline mt-4 w-full text-left flex justify-between items-center">
          Xem tất cả insight <ChevronRight size={14} />
        </button>
      </div>

      {/* Thông báo & Cảnh báo */}
      <div className="bg-card rounded-2xl border border-border p-5 shadow-sm">
        <h3 className="font-extrabold text-foreground mb-4 flex items-center gap-2">
          <AlertCircle size={18} className="text-primary" />
          Thông báo & Cảnh báo
        </h3>
        <div className="space-y-3">
          {alerts.length > 0 ? alerts.map((alert, idx) => (
            <div key={idx} className="flex items-start gap-3 py-2 border-b border-surface last:border-0">
              <div className={`mt-0.5 shrink-0 ${alert.colorText}`}>
                {alert.icon}
              </div>
              <div>
                <p className="text-xs font-bold text-foreground">{alert.title}</p>
                <p className="text-xs text-muted-foreground mt-0.5">{alert.description}</p>
              </div>
            </div>
          )) : (
            <div className="py-6 text-center text-xs text-neutral-muted">Không có cảnh báo nào.</div>
          )}
        </div>
        <button className="text-xs font-bold text-primary hover:underline mt-4 w-full text-left flex justify-between items-center">
          Xem tất cả thông báo <ChevronRight size={14} />
        </button>
      </div>
    </div>
  );
}
