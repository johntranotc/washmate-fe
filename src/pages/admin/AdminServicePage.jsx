import { useEffect, useState } from "react";
import { Plus, RefreshCcw, Pencil, Trash2 } from "lucide-react";
import { garageApi } from "../../api/garageApi";
import { servicePackageApi } from "../../api/servicePackageApi";

export default function AdminServicePage() {
  const [garages, setGarages] = useState([]);
  const [services, setServices] = useState([]);
  const [selectedGarageId, setSelectedGarageId] = useState("");
  const [loadingGarages, setLoadingGarages] = useState(true);
  const [loadingServices, setLoadingServices] = useState(false);

  const [showForm, setShowForm] = useState(false);
  const [saving, setSaving] = useState(false);
  const [formError, setFormError] = useState("");
  const [formData, setFormData] = useState({
    id: null,
    name: "",
    price: "",
    duration: "",
    description: "",
    status: "ACTIVE"
  });

  useEffect(() => {
    garageApi
      .getAll()
      .then((d) => {
        const actualData = d?.data ? d.data : d;
        const list = Array.isArray(actualData) ? actualData : [];
        setGarages(list);
        const firstId = list[0]?.id ?? list[0]?.garageId;
        if (firstId) {
          setSelectedGarageId(String(firstId));
          loadServices(firstId);
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
      .then((s) => {
        const actualServices = s?.data ? s.data : s;
        setServices(Array.isArray(actualServices) ? actualServices : []);
      })
      .catch(() => setServices([]))
      .finally(() => setLoadingServices(false));
  }

  function handleGarageChange(e) {
    setSelectedGarageId(e.target.value);
    loadServices(e.target.value);
    setShowForm(false);
  }

  async function handleSubmit(e) {
    e.preventDefault();
    if (!formData.name.trim() || !formData.price) {
      setFormError("Tên và giá dịch vụ không được để trống.");
      return;
    }
    setFormError("");
    setSaving(true);
    try {
      let payload;
      if (formData.id) {
        // Update payload
        payload = {
          name: formData.name.trim(),
          price: Number(formData.price),
          durationMinutes: Number(formData.duration) || 0,
          description: formData.description.trim(),
          status: formData.status
        };
        const updated = await servicePackageApi.update(formData.id, payload);
        const actualUpdated = updated?.data || updated;
        setServices((prev) => prev.map(s => (s.id ?? s.serviceId ?? s.servicePackageId) === formData.id ? { ...s, ...actualUpdated } : s));
      } else {
        // Create payload
        payload = {
          garageId: Number(selectedGarageId),
          name: formData.name.trim(),
          price: Number(formData.price),
          durationMinutes: Number(formData.duration) || 0,
          description: formData.description.trim()
        };
        const created = await servicePackageApi.create(payload);
        const actualCreated = created?.data || created;
        setServices((prev) => [...prev, actualCreated]);
      }
      
      setShowForm(false);
      resetForm();
    } catch (err) {
      setFormError(err?.message || "Không thể lưu dịch vụ. Vui lòng thử lại.");
    } finally {
      setSaving(false);
    }
  }

  async function handleDelete(serviceId) {
    if (!window.confirm("Bạn có chắc chắn muốn xóa dịch vụ này không?")) return;
    try {
      await servicePackageApi.remove(serviceId);
      setServices((prev) => prev.filter(s => (s.id ?? s.serviceId ?? s.servicePackageId) !== serviceId));
    } catch (err) {
      alert(err?.message || "Không thể xóa dịch vụ.");
    }
  }

  function handleEdit(s) {
    setFormData({
      id: s.id ?? s.serviceId ?? s.servicePackageId,
      name: s.name ?? s.serviceName ?? s.servicePackageName ?? "",
      price: s.price ?? 0,
      duration: s.duration ?? s.durationMinutes ?? 0,
      description: s.description ?? "",
      status: s.status ?? "ACTIVE"
    });
    setFormError("");
    setShowForm(true);
  }

  function resetForm() {
    setFormData({ id: null, name: "", price: "", duration: "", description: "", status: "ACTIVE" });
    setFormError("");
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
          <div className="flex gap-2">
            <button
              onClick={() => loadServices(selectedGarageId)}
              className="flex items-center gap-2 rounded-xl border border-slate-200 bg-white px-3 py-2 text-xs font-bold text-slate-600 hover:bg-slate-50"
            >
              <RefreshCcw size={13} /> Tải lại
            </button>
            <button 
              onClick={() => { resetForm(); setShowForm(!showForm); }} 
              className="flex items-center gap-2 rounded-xl bg-blue-600 px-4 py-2 text-xs font-bold text-white hover:bg-blue-700"
            >
              <Plus size={13} /> Thêm dịch vụ
            </button>
          </div>
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
                <option key={g.id ?? g.garageId} value={g.id ?? g.garageId}>
                  {g.name ?? g.garageName ?? `Gara #${g.id ?? g.garageId}`}
                </option>
              ))}
            </select>
          </div>

          {showForm && (
            <form onSubmit={handleSubmit} className="rounded-2xl border border-blue-200 bg-blue-50 p-5 space-y-4">
              <h2 className="font-extrabold text-blue-900">{formData.id ? "Sửa dịch vụ" : "Thêm dịch vụ mới"}</h2>
              {formError && <p className="rounded-lg border border-red-200 bg-red-50 px-3 py-2 text-xs text-red-600">{formError}</p>}
              <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
                <input value={formData.name} onChange={(e) => setFormData({ ...formData, name: e.target.value })} placeholder="Tên dịch vụ *" required className="h-10 rounded-xl border border-slate-200 bg-white px-3 text-sm outline-none focus:border-blue-500" />
                <input value={formData.price} type="number" onChange={(e) => setFormData({ ...formData, price: e.target.value })} placeholder="Giá tiền (VNĐ) *" required className="h-10 rounded-xl border border-slate-200 bg-white px-3 text-sm outline-none focus:border-blue-500" />
                <input value={formData.duration} type="number" onChange={(e) => setFormData({ ...formData, duration: e.target.value })} placeholder="Thời gian (phút)" className="h-10 rounded-xl border border-slate-200 bg-white px-3 text-sm outline-none focus:border-blue-500" />
                <select value={formData.status} onChange={(e) => setFormData({ ...formData, status: e.target.value })} className="h-10 rounded-xl border border-slate-200 bg-white px-3 text-sm outline-none focus:border-blue-500">
                  <option value="ACTIVE">Hoạt động</option>
                  <option value="INACTIVE">Tạm ngưng</option>
                </select>
              </div>
              <input value={formData.description} onChange={(e) => setFormData({ ...formData, description: e.target.value })} placeholder="Mô tả dịch vụ" className="w-full h-10 rounded-xl border border-slate-200 bg-white px-3 text-sm outline-none focus:border-blue-500" />
              
              <div className="flex gap-2">
                <button type="submit" disabled={saving} className="rounded-xl bg-blue-600 px-5 py-2 text-xs font-bold text-white hover:bg-blue-700 disabled:bg-slate-300">
                  {saving ? "Đang lưu..." : "Lưu dịch vụ"}
                </button>
                <button type="button" onClick={() => setShowForm(false)} className="rounded-xl border border-slate-200 bg-white px-5 py-2 text-xs font-bold text-slate-600 hover:bg-slate-50">
                  Hủy
                </button>
              </div>
            </form>
          )}

          {loadingServices ? (
            <p className="rounded-2xl bg-white border border-slate-200 py-14 text-center text-sm text-slate-500">Đang tải gói dịch vụ...</p>
          ) : services.length === 0 ? (
            <div className="rounded-2xl border border-slate-200 bg-white p-12 text-center">
              <p className="text-sm font-semibold text-slate-600">Gara này chưa có gói dịch vụ nào.</p>
            </div>
          ) : (
            <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-3">
              {services.map((s) => {
                const sid = s.id ?? s.serviceId ?? s.servicePackageId;
                return (
                  <article key={sid} className="rounded-2xl border border-slate-200 bg-white p-5 relative group hover:shadow-md transition-shadow">
                    <div className="absolute top-4 right-4 flex opacity-0 group-hover:opacity-100 transition-opacity gap-2">
                      <button onClick={() => handleEdit(s)} className="rounded p-1.5 text-blue-600 hover:bg-blue-50 bg-white border border-slate-200 shadow-sm" title="Sửa">
                        <Pencil size={14} />
                      </button>
                      <button onClick={() => handleDelete(sid)} className="rounded p-1.5 text-red-600 hover:bg-red-50 bg-white border border-slate-200 shadow-sm" title="Xóa">
                        <Trash2 size={14} />
                      </button>
                    </div>

                    <div className="pr-16">
                      <b className="text-sm font-extrabold text-slate-900">{s.name ?? s.serviceName ?? s.servicePackageName ?? "–"}</b>
                    </div>
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
                );
              })}
            </div>
          )}
        </>
      )}
    </div>
  );
}
