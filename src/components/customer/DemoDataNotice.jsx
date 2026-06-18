import { FlaskConical } from "lucide-react";

export default function DemoDataNotice({ compact = false }) {
  return (
    <div
      className={`flex items-start gap-3 rounded-2xl border border-amber-200 bg-amber-50 text-amber-900 ${
        compact ? "px-3 py-2 text-[11px]" : "px-4 py-3 text-xs"
      }`}
    >
      <FlaskConical className="mt-0.5 shrink-0" size={compact ? 14 : 16} />
      <div>
        <span className="font-extrabold">Dữ liệu mẫu</span>
        {!compact && (
          <p className="mt-1 text-amber-800">
            Dữ liệu này dùng để demo giao diện. API thật sẽ được kết nối sau.
          </p>
        )}
      </div>
    </div>
  );
}
