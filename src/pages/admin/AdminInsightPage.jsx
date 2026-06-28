import { useEffect, useState } from "react";
import { BrainCircuit, RefreshCcw } from "lucide-react";
import { analyticsApi } from "../../api/analyticsApi";

export default function AdminInsightPage() {
  const [summary, setSummary] = useState(null);
  const [behaviorLogs, setBehaviorLogs] = useState([]);
  const [segments, setSegments] = useState([]);
  const [loading, setLoading] = useState(true);

  function load() {
    setLoading(true);
    Promise.all([
      analyticsApi.getAnalyticsSummary().catch(() => ({})),
      analyticsApi.getCustomerBehavior().catch(() => []),
      analyticsApi.getCustomerSegments().catch(() => [])
    ])
      .then(([sum, logs, segs]) => {
        setSummary(sum || {});
        setBehaviorLogs(Array.isArray(logs) ? logs : []);
        setSegments(Array.isArray(segs) ? segs : []);
      })
      .finally(() => setLoading(false));
  }

  useEffect(() => {
    load();
  }, []);

  const hasData = behaviorLogs.length > 0 || segments.length > 0 || Object.keys(summary || {}).length > 0;

  return (
    <div className="space-y-6">
      <header className="flex items-center justify-between">
        <div>
          <p className="text-xs font-bold uppercase tracking-[0.2em] text-blue-600">Quản trị WashMate</p>
          <h1 className="mt-1 flex items-center gap-2 text-2xl font-extrabold text-slate-900">
            <BrainCircuit size={24} className="text-blue-600" /> AI Insight & Analytics
          </h1>
          <p className="mt-1 text-sm text-slate-500">Phân tích hành vi khách hàng và đưa ra gợi ý thông minh.</p>
        </div>
        <button
          onClick={load}
          className="flex items-center gap-2 rounded-xl border border-slate-200 bg-white px-3 py-2 text-xs font-bold text-slate-600 hover:bg-slate-50"
        >
          <RefreshCcw size={13} /> Tải lại
        </button>
      </header>

      {loading ? (
        <div className="rounded-2xl border border-slate-200 bg-white p-12 text-center text-sm text-slate-500">
          Đang phân tích dữ liệu AI...
        </div>
      ) : !hasData ? (
        <div className="rounded-2xl border border-slate-200 bg-white p-12 text-center">
          <BrainCircuit size={48} className="mx-auto text-slate-300" />
          <p className="mt-4 text-sm font-semibold text-slate-600">Chưa có dữ liệu phân tích hành vi.</p>
          <p className="mt-2 text-xs text-slate-400">
            Hệ thống cần thu thập thêm dữ liệu booking và tương tác từ khách hàng để đưa ra các gợi ý AI.
          </p>
        </div>
      ) : (
        <div className="space-y-6">
          {/* Dashboard blocks would go here if data exists */}
          <div className="rounded-2xl border border-slate-200 bg-white p-12 text-center">
            <p className="text-sm font-semibold text-slate-600">Chưa có dữ liệu phân tích hành vi.</p>
          </div>
        </div>
      )}
    </div>
  );
}
