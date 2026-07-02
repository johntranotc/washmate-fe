import { useEffect, useMemo, useState } from "react";
import { Plus, RefreshCcw, Pencil, Trash2, Building2, MapPin, Phone, CalendarDays, CircleDollarSign } from "lucide-react";
import { garageApi } from "../../api/garageApi";
import { adminApi } from "../../api/adminApi";
import { normalizeBookingList, normalizeStaffBooking } from "../../lib/staff-booking-data";
import { formatMoneyShort, formatNumber } from "../../lib/format";

export default function AdminGaragePage() {
  const [garages, setGarages] = useState([]);
  const [loading, setLoading] = useState(true);
  const [bookings, setBookings] = useState([]);

  // Thống kê thật theo gara, tổng hợp từ dữ liệu booking (BE chưa có endpoint tổng hợp riêng)
  useEffect(() => {
    adminApi.getBookings({ size: 1000 })
      .then((res) => setBookings(normalizeBookingList(res).map(normalizeStaffBooking)))
      .catch(() => setBookings([]));
  }, []);

  const statsByGarage = useMemo(() => {
    const m = {};
    bookings.forEach((b) => {
      const gid = String(b.garageId ?? "");
      if (!gid) return;
      if (!m[gid]) m[gid] = { bookings: 0, revenue: 0 };
      m[gid].bookings += 1;
      if (b.bookingStatus === "COMPLETED") m[gid].revenue += Number(b.finalAmount || 0);
    });
    return m;
  }, [bookings]);
  const [formData, setFormData] = useState({ id: null, name: "", address: "", phone: "" });
  const [saving, setSaving] = useState(false);
  const [showForm, setShowForm] = useState(false);
  const [formError, setFormError] = useState("");

  function load() {
    setLoading(true);
    garageApi
      .getAll()
      .then((d) => {
        const actualData = d?.data ? d.data : d;
        setGarages(Array.isArray(actualData) ? actualData : [])
      })
      .catch(() => setGarages([]))
      .finally(() => setLoading(false));
  }

  useEffect(() => { load(); }, []);

  async function handleSubmit(e) {
    e.preventDefault();
    if (!formData.name.trim()) { setFormError("Tên cơ sở không được để trống."); return; }
    setFormError("");
    setSaving(true);
    try {
      const payload = { name: formData.name.trim(), address: formData.address.trim(), phone: formData.phone.trim() || undefined };
      if (formData.id) {
        // Update
        const updated = await garageApi.update(formData.id, payload);
        const actualUpdated = updated?.data || updated;
        setGarages((prev) => prev.map(g => (g.id ?? g.garageId) === formData.id ? { ...g, ...actualUpdated } : g));
      } else {
        // Create
        const created = await garageApi.create(payload);
        const actualCreated = created?.data || created;
        setGarages((prev) => [...prev, actualCreated]);
      }
      setFormData({ id: null, name: "", address: "", phone: "" });
      setShowForm(false);
    } catch (err) {
      setFormError(err?.message || "Không thể lưu gara. Vui lòng thử lại.");
    } finally {
      setSaving(false);
    }
  }

  async function handleDelete(garageId) {
    if (!window.confirm("Bạn có chắc chắn muốn xóa gara này không? Hành động này không thể hoàn tác.")) return;
    
    try {
      await garageApi.remove(garageId);
      setGarages((prev) => prev.filter(g => (g.id ?? g.garageId) !== garageId));
    } catch (err) {
      alert(err?.message || "Không thể xóa gara. Vui lòng thử lại.");
    }
  }

  function handleEdit(g) {
    setFormData({
      id: g.id ?? g.garageId,
      name: g.name ?? g.garageName ?? "",
      address: g.address ?? g.location ?? "",
      phone: g.phone ?? "",
    });
    setFormError("");
    setShowForm(true);
  }

  return (
    <div className="mx-auto max-w-[1600px] space-y-6 p-4 sm:p-8">
      <header className="flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between">
        <div>
          <h1 className="text-3xl font-extrabold text-slate-900">Cơ sở / Chi nhánh</h1>
          <p className="mt-1 text-sm text-slate-500">Quản lý danh sách các cơ sở rửa xe trong chuỗi.</p>
        </div>
        <div className="flex gap-2">
          <button onClick={load} className="flex items-center gap-2 rounded-xl border border-slate-200 bg-white px-3 py-2 text-xs font-bold text-slate-600 hover:bg-slate-50">
            <RefreshCcw size={13} /> Tải lại
          </button>
          <button onClick={() => { setFormData({ id: null, name: "", address: "", phone: "" }); setShowForm(!showForm); }} className="flex items-center gap-2 rounded-xl bg-blue-600 px-4 py-2 text-xs font-bold text-white hover:bg-blue-700">
            <Plus size={13} /> Thêm gara
          </button>
        </div>
      </header>

      {showForm && (
        <form onSubmit={handleSubmit} className="rounded-2xl border border-blue-200 bg-blue-50 p-5 space-y-3">
          <h2 className="font-extrabold text-blue-900">{formData.id ? "Sửa thông tin cơ sở" : "Thêm cơ sở mới"}</h2>
          {formError && <p className="rounded-lg border border-red-200 bg-red-50 px-3 py-2 text-xs text-red-600">{formError}</p>}
          <div className="grid gap-3 sm:grid-cols-3">
            <input value={formData.name} onChange={(e) => setFormData({ ...formData, name: e.target.value })} placeholder="Tên cơ sở *" required className="h-10 rounded-xl border border-slate-200 bg-white px-3 text-sm outline-none focus:border-blue-500" />
            <input value={formData.address} onChange={(e) => setFormData({ ...formData, address: e.target.value })} placeholder="Địa chỉ" className="h-10 rounded-xl border border-slate-200 bg-white px-3 text-sm outline-none focus:border-blue-500" />
            <input value={formData.phone} onChange={(e) => setFormData({ ...formData, phone: e.target.value })} placeholder="Số điện thoại" className="h-10 rounded-xl border border-slate-200 bg-white px-3 text-sm outline-none focus:border-blue-500" />
          </div>
          <div className="flex gap-2">
            <button type="submit" disabled={saving} className="rounded-xl bg-blue-600 px-5 py-2 text-xs font-bold text-white hover:bg-blue-700 disabled:bg-slate-300">
              {saving ? "Đang lưu..." : "Lưu thông tin"}
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
            {garages.map((g) => {
              const gid = g.id ?? g.garageId;
              const st = statsByGarage[String(gid)] || { bookings: 0, revenue: 0 };
              const active = (g.status || "ACTIVE") === "ACTIVE";
              return (
                <article key={gid} className="rounded-2xl border border-slate-200 bg-white p-5 hover:shadow-md transition-shadow relative group">
                  <div className="absolute top-4 right-4 flex opacity-0 group-hover:opacity-100 transition-opacity gap-2">
                    <button onClick={() => handleEdit(g)} className="rounded p-1.5 text-blue-600 hover:bg-blue-50 bg-white border border-slate-200 shadow-sm" title="Sửa">
                      <Pencil size={14} />
                    </button>
                    <button onClick={() => handleDelete(gid)} className="rounded p-1.5 text-red-600 hover:bg-red-50 bg-white border border-slate-200 shadow-sm" title="Xóa">
                      <Trash2 size={14} />
                    </button>
                  </div>
                  <div className="flex items-start gap-3 pr-16">
                    <span className="grid h-10 w-10 shrink-0 place-items-center rounded-xl bg-blue-50 text-blue-600"><Building2 size={18} /></span>
                    <div className="min-w-0">
                      <b className="block truncate text-sm font-extrabold leading-tight text-slate-900">{g.name ?? g.garageName ?? "–"}</b>
                      <span className={`mt-1 inline-block rounded-full px-2 py-0.5 text-[10px] font-bold ${active ? "bg-emerald-100 text-emerald-700" : "bg-slate-100 text-slate-600"}`}>
                        {active ? "Đang hoạt động" : "Tạm ngưng"}
                      </span>
                    </div>
                  </div>
                  <div className="mt-3 space-y-1">
                    {(g.address || g.location) && (
                      <p className="flex items-center gap-1.5 text-xs text-slate-500"><MapPin size={12} className="shrink-0 text-slate-400" /><span className="truncate">{g.address ?? g.location}</span></p>
                    )}
                    {g.phone && <p className="flex items-center gap-1.5 text-xs text-slate-500"><Phone size={12} className="shrink-0 text-slate-400" />{g.phone}</p>}
                  </div>
                  <div className="mt-4 grid grid-cols-2 gap-3 border-t border-slate-100 pt-3">
                    <div>
                      <p className="flex items-center gap-1 text-[10px] font-bold uppercase tracking-wider text-slate-400"><CalendarDays size={11} /> Số lịch</p>
                      <p className="mt-0.5 text-sm font-black text-slate-900">{formatNumber(st.bookings)}</p>
                    </div>
                    <div>
                      <p className="flex items-center gap-1 text-[10px] font-bold uppercase tracking-wider text-slate-400"><CircleDollarSign size={11} /> Doanh thu</p>
                      <p className="mt-0.5 text-sm font-black text-blue-600">{formatMoneyShort(st.revenue)}</p>
                    </div>
                  </div>
                </article>
              );
            })}
          </div>
        )}
      </section>
    </div>
  );
}
