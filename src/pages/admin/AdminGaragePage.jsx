import { useEffect, useState } from "react";
import { Plus, RefreshCcw } from "lucide-react";
import { garageApi } from "../../api/garageApi";

export default function AdminGaragePage() {
  const [garages, setGarages] = useState([]);
  const [loading, setLoading] = useState(true);
  const [newGarage, setNewGarage] = useState({ name: "", address: "", phone: "" });
  const [saving, setSaving] = useState(false);
  const [showForm, setShowForm] = useState(false);
  const [formError, setFormError] = useState("");

  function load() {
    setLoading(true);
    garageApi
      .getAll()
      .then((d) => setGarages(Array.isArray(d) ? d : []))
      .catch(() => setGarages([]))
      .finally(() => setLoading(false));
  }

  useEffect(() => { load(); }, []);

  async function handleCreate(e) {
    e.preventDefault();
    if (!newGarage.name.trim()) { setFormError("Tên cơ sở không được để trống."); return; }
    setFormError("");
    setSaving(true);
    try {
      const created = await garageApi.create({ name: newGarage.name.trim(), address: newGarage.address.trim(), phone: newGarage.phone.trim() || undefined });
      setGarages((prev) => [...prev, created]);
      setNewGarage({ name: "", address: "", phone: "" });
      setShowForm(false);
    } catch (err) {
      setFormError(err?.message || "Không thể tạo gara. Vui lòng thử lại.");
    } finally {
      setSaving(false);
    }
  }

  return (
    <div className="space-y-6">
      <header className="flex items-center justify-between">
        <div>
          <p className="text-xs font-bold uppercase tracking-[0.2em] text-blue-600">Quản trị WashMate</p>
          <h1 className="mt-1 text-2xl font-extrabold text-slate-900">Quản lý Gara</h1>
          <p className="mt-1 text-sm text-slate-500">Danh sách các cơ sở rửa xe trong hệ thống.</p>
        </div>
        <div className="flex gap-2">
          <button onClick={load} className="flex items-center gap-2 rounded-xl border border-slate-200 bg-white px-3 py-2 text-xs font-bold text-slate-600 hover:bg-slate-50">
            <RefreshCcw size={13} /> Tải lại
          </button>
          <button onClick={() => setShowForm(!showForm)} className="flex items-center gap-2 rounded-xl bg-blue-600 px-4 py-2 text-xs font-bold text-white hover:bg-blue-700">
            <Plus size={13} /> Thêm gara
          </button>
        </div>
      </header>

      {showForm && (
        <form onSubmit={handleCreate} className="rounded-2xl border border-blue-200 bg-blue-50 p-5 space-y-3">
          <h2 className="font-extrabold text-blue-900">Thêm cơ sở mới</h2>
          {formError && <p className="rounded-lg border border-red-200 bg-red-50 px-3 py-2 text-xs text-red-600">{formError}</p>}
          <div className="grid gap-3 sm:grid-cols-3">
            <input value={newGarage.name} onChange={(e) => setNewGarage({ ...newGarage, name: e.target.value })} placeholder="Tên cơ sở *" required className="h-10 rounded-xl border border-slate-200 bg-white px-3 text-sm outline-none focus:border-blue-500" />
            <input value={newGarage.address} onChange={(e) => setNewGarage({ ...newGarage, address: e.target.value })} placeholder="Địa chỉ" className="h-10 rounded-xl border border-slate-200 bg-white px-3 text-sm outline-none focus:border-blue-500" />
            <input value={newGarage.phone} onChange={(e) => setNewGarage({ ...newGarage, phone: e.target.value })} placeholder="Số điện thoại" className="h-10 rounded-xl border border-slate-200 bg-white px-3 text-sm outline-none focus:border-blue-500" />
          </div>
          <div className="flex gap-2">
            <button type="submit" disabled={saving} className="rounded-xl bg-blue-600 px-5 py-2 text-xs font-bold text-white hover:bg-blue-700 disabled:bg-slate-300">
              {saving ? "Đang tạo..." : "Tạo cơ sở"}
            </button>
            <button type="button" onClick={() => { setShowForm(false); setFormError(""); }} className="rounded-xl border border-slate-200 bg-white px-5 py-2 text-xs font-bold text-slate-600 hover:bg-slate-50">
              Hủy
            </button>
          </div>
        </form>
      )}

      <section>
        {loading ? (
          <p className="rounded-2xl bg-white border border-slate-200 py-14 text-center text-sm text-slate-500">Đang tải danh sách gara...</p>
        ) : garages.length === 0 ? (
          <div className="rounded-2xl border border-slate-200 bg-white p-12 text-center">
            <p className="text-sm font-semibold text-slate-600">Chưa có gara nào trong hệ thống.</p>
            <p className="mt-1 text-xs text-slate-400">Bấm "Thêm gara" để tạo cơ sở đầu tiên.</p>
          </div>
        ) : (
          <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-3">
            {garages.map((g) => (
              <article key={g.id} className="rounded-2xl border border-slate-200 bg-white p-5 hover:shadow-md transition-shadow">
                <div className="flex items-start justify-between gap-2">
                  <b className="text-sm font-extrabold text-slate-900 leading-tight">{g.name ?? g.garageName ?? "–"}</b>
                  <span className="shrink-0 rounded-full bg-emerald-100 px-2 py-0.5 text-[10px] font-bold text-emerald-700">#{g.id}</span>
                </div>
                {(g.address || g.location) && (
                  <p className="mt-2 text-xs text-slate-500">📍 {g.address ?? g.location}</p>
                )}
                {g.phone && <p className="mt-1 text-xs text-slate-500">📞 {g.phone}</p>}
                {g.slotsPerDay != null && (
                  <p className="mt-1 text-xs text-slate-400">Slot/ngày: {g.slotsPerDay}</p>
                )}
              </article>
            ))}
          </div>
        )}
      </section>
    </div>
  );
}
