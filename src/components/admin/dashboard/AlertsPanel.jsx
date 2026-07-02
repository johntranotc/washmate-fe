import { AlertCircle } from "lucide-react";

/** Thông báo & Cảnh báo. alerts: [{ title, description, colorText, icon }] */
export function AlertsPanel({ alerts = [] }) {
  return (
    <div className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm">
      <h3 className="mb-4 flex items-center gap-2 font-extrabold text-slate-800">
        <AlertCircle size={18} className="text-blue-600" /> Thông báo &amp; Cảnh báo
      </h3>
      <div className="space-y-3">
        {alerts.length > 0 ? alerts.map((a, i) => (
          <div key={i} className="flex items-start gap-3 border-b border-slate-50 py-2 last:border-0">
            <span className={`mt-0.5 shrink-0 ${a.colorText}`}>{a.icon}</span>
            <div className="min-w-0">
              <p className="text-[11px] font-bold text-slate-800">{a.title}</p>
              <p className="mt-0.5 text-[10px] text-slate-500">{a.description}</p>
            </div>
          </div>
        )) : (
          <p className="py-6 text-center text-xs text-slate-400">Không có cảnh báo nào.</p>
        )}
      </div>
    </div>
  );
}
