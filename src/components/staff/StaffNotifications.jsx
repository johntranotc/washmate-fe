import { AlertTriangle, Info, Clock } from "lucide-react";

/**
 * "Thông báo" cho staff — danh sách cảnh báo suy ra từ booking thật (không bịa).
 * items: [{ tone: 'warn'|'info', title, desc }]
 */
export function StaffNotifications({ items = [] }) {
  const iconByTone = {
    warn: { Icon: AlertTriangle, cls: "text-rose-500 bg-rose-50" },
    time: { Icon: Clock, cls: "text-orange-500 bg-orange-50" },
    info: { Icon: Info, cls: "text-blue-500 bg-blue-50" },
  };

  return (
    <section className="rounded-2xl border border-slate-200 bg-white p-5">
      <div className="flex items-center gap-2">
        <h2 className="font-extrabold text-slate-800">Thông báo</h2>
        {items.length > 0 && (
          <span className="grid h-5 min-w-5 place-items-center rounded-full bg-rose-500 px-1 text-[10px] font-extrabold text-white">
            {items.length}
          </span>
        )}
      </div>
      <div className="mt-4 space-y-3">
        {items.length === 0 ? (
          <p className="py-6 text-center text-xs text-slate-400">Không có thông báo nào.</p>
        ) : (
          items.map((it, i) => {
            const { Icon, cls } = iconByTone[it.tone] || iconByTone.info;
            return (
              <div key={i} className="flex items-start gap-3">
                <span className={`grid h-8 w-8 shrink-0 place-items-center rounded-full ${cls}`}>
                  <Icon size={15} />
                </span>
                <div className="min-w-0">
                  <p className="text-xs font-bold text-slate-800">{it.title}</p>
                  <p className="mt-0.5 text-[11px] text-slate-500">{it.desc}</p>
                </div>
              </div>
            );
          })
        )}
      </div>
    </section>
  );
}
