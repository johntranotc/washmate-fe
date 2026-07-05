import { AlertTriangle, Info, Clock } from "lucide-react";

/**
 * "Thông báo" cho staff — danh sách cảnh báo suy ra từ booking thật (không bịa).
 * items: [{ tone: 'warn'|'info', title, desc }]
 */
export function StaffNotifications({ items = [] }) {
  const iconByTone = {
    warn: { Icon: AlertTriangle, cls: "text-critical bg-critical-container" },
    time: { Icon: Clock, cls: "text-warning bg-warning-container" },
    info: { Icon: Info, cls: "text-primary bg-primary-container" },
  };

  return (
    <section className="rounded-2xl border border-border bg-card p-5">
      <div className="flex items-center gap-2">
        <h2 className="font-extrabold text-foreground">Thông báo</h2>
        {items.length > 0 && (
          <span className="grid h-5 min-w-5 place-items-center rounded-full bg-critical px-1 text-xs font-extrabold text-white">
            {items.length}
          </span>
        )}
      </div>
      <div className="mt-4 space-y-3">
        {items.length === 0 ? (
          <p className="py-6 text-center text-xs text-neutral-muted">Không có thông báo nào.</p>
        ) : (
          items.map((it, i) => {
            const { Icon, cls } = iconByTone[it.tone] || iconByTone.info;
            return (
              <div key={i} className="flex items-start gap-3">
                <span className={`grid h-8 w-8 shrink-0 place-items-center rounded-full ${cls}`}>
                  <Icon size={16} />
                </span>
                <div className="min-w-0">
                  <p className="text-xs font-bold text-foreground">{it.title}</p>
                  <p className="mt-0.5 text-xs text-muted-foreground">{it.desc}</p>
                </div>
              </div>
            );
          })
        )}
      </div>
    </section>
  );
}
