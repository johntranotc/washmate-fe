import { useEffect, useState } from "react";
import { RefreshCcw } from "lucide-react";
import { garageApi } from "../../api/garageApi";
import { servicePackageApi } from "../../api/servicePackageApi";

export default function AdminServicePage() {
  const [garages, setGarages] = useState([]);
  const [services, setServices] = useState([]);
  const [selectedGarageId, setSelectedGarageId] = useState("");
  const [loadingGarages, setLoadingGarages] = useState(true);
  const [loadingServices, setLoadingServices] = useState(false);

  useEffect(() => {
    garageApi
      .getAll()
      .then((d) => {
        const list = Array.isArray(d) ? d : [];
        setGarages(list);
        if (list[0]?.id) {
          setSelectedGarageId(String(list[0].id));
          loadServices(list[0].id);
        }
      })
      .catch(() => setGarages([]))
      .finally(() => setLoadingGarages(false));
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  function loadServices(garageId) {
    setLoadingServices(true);
    servicePackageApi
      .getAll(garageId)
      .then((s) => setServices(Array.isArray(s) ? s : []))
      .catch(() => setServices([]))
      .finally(() => setLoadingServices(false));
  }

  function handleGarageChange(e) {
    setSelectedGarageId(e.target.value);
    loadServices(e.target.value);
  }

  return (
    <div className="space-y-6">
      <header className="flex items-center justify-between">
        <div>
          <p className="text-xs font-bold uppercase tracking-[0.2em] text-blue-600">Quản trị WashMate</p>
          <h1 className="mt-1 text-2xl font-extrabold text-slate-900">Gói dịch vụ</h1>
          <p className="mt-1 text-sm text-slate-500">Danh mục dịch vụ rửa xe theo từng gara.</p>
        </div>
        {selectedGarageId && (
          <button
            onClick={() => loadServices(selectedGarageId)}
            className="flex items-center gap-2 rounded-xl border border-slate-200 bg-white px-3 py-2 text-xs font-bold text-slate-600 hover:bg-slate-50"
          >
            <RefreshCcw size={13} /> Tải lại
          </button>
        )}
      </header>

      {loadingGarages ? (
        <p className="text-sm text-slate-500">Đang tải danh sách gara...</p>
      ) : garages.length === 0 ? (
        <div className="rounded-2xl border border-slate-200 bg-white p-10 text-center text-sm text-slate-400">
          Chưa có gara nào để hiển thị dịch vụ.
        </div>
      ) : (
        <>
          <div className="flex items-center gap-3">
            <label className="text-xs font-bold text-slate-600">Chọn gara:</label>
            <select
              value={selectedGarageId}
              onChange={handleGarageChange}
              className="rounded-xl border border-slate-200 bg-white px-3 py-2 text-sm outline-none focus:border-blue-500"
            >
              {garages.map((g) => (
                <option key={g.id} value={g.id}>
                  {g.name ?? g.garageName ?? `Gara #${g.id}`}
                </option>
              ))}
            </select>
          </div>

          {loadingServices ? (
            <p className="rounded-2xl bg-white border border-slate-200 py-14 text-center text-sm text-slate-500">Đang tải gói dịch vụ...</p>
          ) : services.length === 0 ? (
            <div className="rounded-2xl border border-slate-200 bg-white p-12 text-center">
              <p className="text-sm font-semibold text-slate-600">Gara này chưa có gói dịch vụ nào.</p>
            </div>
          ) : (
            <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-3">
              {services.map((s) => (
                <article key={s.id ?? s.serviceId} className="rounded-2xl border border-slate-200 bg-white p-5">
                  <b className="text-sm font-extrabold text-slate-900">{s.name ?? s.serviceName ?? "–"}</b>
                  <p className="mt-3 text-xl font-extrabold text-blue-600">
                    {new Intl.NumberFormat("vi-VN").format(s.price ?? 0)} đ
                  </p>
                  <p className="mt-1 text-xs text-slate-500">⏱ {s.duration ?? s.durationMinutes ?? 0} phút</p>
                  {s.description && (
                    <p className="mt-2 text-xs text-slate-400 leading-relaxed">{s.description}</p>
                  )}
                  {s.status && (
                    <span className={`mt-3 inline-block rounded-full px-2 py-0.5 text-[10px] font-bold ${
                      s.status === "ACTIVE" ? "bg-emerald-100 text-emerald-700" : "bg-slate-100 text-slate-600"
                    }`}>
                      {s.status}
                    </span>
                  )}
                </article>
              ))}
            </div>
          )}
        </>
      )}
    </div>
  );
}
