import { Link } from "react-router-dom";
import { TrendingUp, AlertTriangle, Lightbulb, ThumbsUp } from "lucide-react";

const SEVERITY_STYLE = {
  CRITICAL: { Icon: AlertTriangle, cls: "bg-critical-container text-critical" },
  WARNING: { Icon: AlertTriangle, cls: "bg-warning-container text-warning" },
  OPPORTUNITY: { Icon: TrendingUp, cls: "bg-primary-container text-primary" },
  POSITIVE: { Icon: ThumbsUp, cls: "bg-success-container text-success" },
};

/**
 * "Insight vận hành" — tối đa 2 insight nổi bật từ GET /api/owner/insights
 * (rule-based thật của BE) hoặc rule tính từ booking thật ở FE.
 * insights: [{ title, description, severity }]
 */
export function OperationalInsightPanel({ insights = [] }) {
  const visible = insights.slice(0, 2);

  return (
    <section className="rounded-2xl border border-border bg-card p-5">
      <div className="flex items-center justify-between gap-3">
        <h2 className="flex items-center gap-2 text-lg font-bold text-foreground">
          <Lightbulb size={18} className="text-primary" /> Insight vận hành
        </h2>
        <Link to="/quan-tri/ai-insights" className="text-xs font-bold text-primary hover:underline">
          Xem tất cả
        </Link>
      </div>
      <div className="mt-4 space-y-3">
        {visible.length === 0 ? (
          <p className="py-6 text-center text-xs text-neutral-muted">
            Chưa đủ dữ liệu trong kỳ để tạo insight.
          </p>
        ) : (
          visible.map((it, i) => {
            const { Icon, cls } = SEVERITY_STYLE[it.severity] || SEVERITY_STYLE.OPPORTUNITY;
            return (
              <div key={i} className="flex items-start gap-3 rounded-xl border border-border bg-surface p-3.5">
                <span className={`grid h-9 w-9 shrink-0 place-items-center rounded-xl ${cls}`}>
                  <Icon size={16} />
                </span>
                <div className="min-w-0">
                  <p className="text-sm font-bold leading-5 text-foreground">{it.title}</p>
                  {it.description && (
                    <p className="mt-0.5 text-xs leading-5 text-muted-foreground">{it.description}</p>
                  )}
                </div>
              </div>
            );
          })
        )}
      </div>
    </section>
  );
}
