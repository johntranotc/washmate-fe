import { AlertCircle } from "lucide-react";

/** Thông báo & Cảnh báo. alerts: [{ title, description, colorText, icon }] */
export function AlertsPanel({ alerts = [] }) {
  return (
    <div className="rounded-2xl border border-border bg-card p-5 shadow-sm">
      <h3 className="mb-4 flex items-center gap-2 font-extrabold text-foreground">
        <AlertCircle size={18} className="text-primary" /> Thông báo &amp; Cảnh báo
      </h3>
      <div className="space-y-3">
        {alerts.length > 0 ? alerts.map((a, i) => (
          <div key={i} className="flex items-start gap-3 border-b border-surface py-2 last:border-0">
            <span className={`mt-0.5 shrink-0 ${a.colorText}`}>{a.icon}</span>
            <div className="min-w-0">
              <p className="text-xs font-bold text-foreground">{a.title}</p>
              <p className="mt-0.5 text-xs text-muted-foreground">{a.description}</p>
            </div>
          </div>
        )) : (
          <p className="py-6 text-center text-xs text-neutral-muted">Không có cảnh báo nào.</p>
        )}
      </div>
    </div>
  );
}
