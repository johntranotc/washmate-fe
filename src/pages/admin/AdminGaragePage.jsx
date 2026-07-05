import { useEffect, useMemo, useState } from "react";
import PageContainer from "@/components/shared/PageContainer";
import PageHeader from "@/components/shared/PageHeader";
import { Plus, RefreshCcw, Pencil, Trash2, Building2, MapPin, Phone, CalendarDays, CircleDollarSign } from "lucide-react";
import { garageApi } from "../../api/garageApi";
import { adminApi } from "../../api/adminApi";
import { normalizeBookingList, normalizeStaffBooking } from "../../lib/staff-booking-data";
import { formatMoneyShort, formatNumber } from "../../lib/format";
import { toast } from "@/components/ui/toast";
import { confirmDialog } from "@/components/shared/ConfirmDialog";
import { Button } from "@/components/ui/button";

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
    const confirmed = await confirmDialog({
      title: "Xóa gara này?",
      description: "Hành động này không thể hoàn tác.",
      confirmLabel: "Xóa gara",
      destructive: true,
    });
    if (!confirmed) return;

    try {
      await garageApi.remove(garageId);
      setGarages((prev) => prev.filter(g => (g.id ?? g.garageId) !== garageId));
      toast.success("Đã xóa gara.");
    } catch (err) {
      toast.error("Không thể xóa gara", { description: err?.message || "Vui lòng thử lại." });
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
    <PageContainer>
      <PageHeader
        title="Cơ sở / Chi nhánh"
        description="Quản lý danh sách các cơ sở rửa xe trong chuỗi."
        actions={
          <div className="flex gap-2">
            <Button variant="outline" size="sm" onClick={load} className="text-xs text-muted-foreground">
              <RefreshCcw /> Tải lại
            </Button>
            <Button size="sm" onClick={() => { setFormData({ id: null, name: "", address: "", phone: "" }); setShowForm(!showForm); }} className="text-xs">
              <Plus /> Thêm gara
            </Button>
          </div>
        }
      />

      {showForm && (
        <form onSubmit={handleSubmit} className="rounded-2xl border border-primary/20 bg-primary-container p-5 space-y-3">
          <h2 className="font-extrabold text-primary-strong">{formData.id ? "Sửa thông tin cơ sở" : "Thêm cơ sở mới"}</h2>
          {formError && <p className="rounded-lg border border-critical/25 bg-critical-container px-3 py-2 text-xs text-critical">{formError}</p>}
          <div className="grid gap-3 sm:grid-cols-3">
            <input value={formData.name} onChange={(e) => setFormData({ ...formData, name: e.target.value })} placeholder="Tên cơ sở *" required className="h-10 rounded-xl border border-border bg-card px-3 text-sm outline-none focus:border-primary" />
            <input value={formData.address} onChange={(e) => setFormData({ ...formData, address: e.target.value })} placeholder="Địa chỉ" className="h-10 rounded-xl border border-border bg-card px-3 text-sm outline-none focus:border-primary" />
            <input value={formData.phone} onChange={(e) => setFormData({ ...formData, phone: e.target.value })} placeholder="Số điện thoại" className="h-10 rounded-xl border border-border bg-card px-3 text-sm outline-none focus:border-primary" />
          </div>
          <div className="flex gap-2">
            <Button type="submit" size="sm" disabled={saving} className="px-5 text-xs">
              {saving ? "Đang lưu..." : "Lưu thông tin"}
            </Button>
            <Button variant="outline" size="sm" onClick={() => { setShowForm(false); setFormError(""); }} className="px-5 text-xs text-muted-foreground">
              Hủy
            </Button>
          </div>
        </form>
      )}

      <section>
        {loading ? (
          <p className="rounded-2xl bg-card border border-border py-14 text-center text-sm text-muted-foreground">Đang tải danh sách gara...</p>
        ) : garages.length === 0 ? (
          <div className="rounded-2xl border border-border bg-card p-12 text-center">
            <p className="text-sm font-semibold text-muted-foreground">Chưa có gara nào trong hệ thống.</p>
            <p className="mt-1 text-xs text-neutral-muted">Bấm "Thêm gara" để tạo cơ sở đầu tiên.</p>
          </div>
        ) : (
          <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-3">
            {garages.map((g) => {
              const gid = g.id ?? g.garageId;
              const st = statsByGarage[String(gid)] || { bookings: 0, revenue: 0 };
              const active = (g.status || "ACTIVE") === "ACTIVE";
              return (
                <article key={gid} className="rounded-2xl border border-border bg-card p-5 hover:shadow-card transition-shadow relative group">
                  <div className="absolute top-4 right-4 flex opacity-0 group-hover:opacity-100 transition-opacity gap-2">
                    <Button variant="outline" size="icon-sm" onClick={() => handleEdit(g)} className="text-primary hover:bg-primary-container" title="Sửa">
                      <Pencil className="size-3.5" />
                    </Button>
                    <Button variant="outline" size="icon-sm" onClick={() => handleDelete(gid)} className="text-critical hover:bg-critical-container" title="Xóa">
                      <Trash2 className="size-3.5" />
                    </Button>
                  </div>
                  <div className="flex items-start gap-3 pr-16">
                    <span className="grid h-10 w-10 shrink-0 place-items-center rounded-xl bg-primary-container text-primary"><Building2 size={18} /></span>
                    <div className="min-w-0">
                      <b className="block truncate text-sm font-extrabold leading-tight text-foreground">{g.name ?? g.garageName ?? "–"}</b>
                      <span className={`mt-1 inline-block rounded-full px-2 py-0.5 text-xs font-bold ${active ? "bg-success-container text-success" : "bg-muted text-muted-foreground"}`}>
                        {active ? "Đang hoạt động" : "Tạm ngưng"}
                      </span>
                    </div>
                  </div>
                  <div className="mt-3 space-y-1">
                    {(g.address || g.location) && (
                      <p className="flex items-center gap-1.5 text-xs text-muted-foreground"><MapPin size={14} className="shrink-0 text-neutral-muted" /><span className="truncate">{g.address ?? g.location}</span></p>
                    )}
                    {g.phone && <p className="flex items-center gap-1.5 text-xs text-muted-foreground"><Phone size={14} className="shrink-0 text-neutral-muted" />{g.phone}</p>}
                  </div>
                  <div className="mt-4 grid grid-cols-2 gap-3 border-t border-border pt-3">
                    <div>
                      <p className="flex items-center gap-1 text-xs font-semibold text-neutral-muted"><CalendarDays size={14} /> Số lịch</p>
                      <p className="mt-0.5 text-sm font-black text-foreground">{formatNumber(st.bookings)}</p>
                    </div>
                    <div>
                      <p className="flex items-center gap-1 text-xs font-semibold text-neutral-muted"><CircleDollarSign size={14} /> Doanh thu</p>
                      <p className="mt-0.5 text-sm font-black text-primary">{formatMoneyShort(st.revenue)}</p>
                    </div>
                  </div>
                </article>
              );
            })}
          </div>
        )}
      </section>
    </PageContainer>
  );
}
