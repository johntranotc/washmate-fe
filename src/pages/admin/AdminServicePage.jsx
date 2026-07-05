import { useEffect, useMemo, useState } from "react";
import PageContainer from "@/components/shared/PageContainer";
import PageHeader from "@/components/shared/PageHeader";
import { Plus, RefreshCcw, Pencil, Trash2, Car, Package, Search, AlertTriangle } from "lucide-react";
import { garageApi } from "../../api/garageApi";
import { servicePackageApi } from "../../api/servicePackageApi";
import { vehicleApi } from "../../api/vehicleApi";
import Pagination from "../../components/common/Pagination";
import { toast } from "@/components/ui/toast";
import { confirmDialog } from "@/components/shared/ConfirmDialog";
import { Button } from "@/components/ui/button";

const VEHICLE_PAGE_SIZE = 10;

export default function AdminServicePage() {
  const [tab, setTab] = useState("services"); // services | vehicles
  const [garages, setGarages] = useState([]);
  const [services, setServices] = useState([]);
  const [selectedGarageId, setSelectedGarageId] = useState("");
  const [loadingGarages, setLoadingGarages] = useState(true);
  const [loadingServices, setLoadingServices] = useState(false);

  // Xe khách hàng (GET /api/v1/vehicles — endpoint thật, chỉ ADMIN/STAFF)
  const [vehicles, setVehicles] = useState([]);
  const [vehiclesLoading, setVehiclesLoading] = useState(false);
  const [vehiclesError, setVehiclesError] = useState(null);
  const [vehicleKeyword, setVehicleKeyword] = useState("");
  const [vehiclePage, setVehiclePage] = useState(1);

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

  function loadVehicles() {
    setVehiclesLoading(true);
    setVehiclesError(null);
    vehicleApi.getAllVehicles()
      .then((res) => {
        const list = Array.isArray(res) ? res : res?.content || res?.data || [];
        setVehicles(list);
      })
      .catch((e) => { setVehiclesError(e?.message || "Không thể tải danh sách xe."); setVehicles([]); })
      .finally(() => setVehiclesLoading(false));
  }

  useEffect(() => {
    if (tab === "vehicles" && vehicles.length === 0 && !vehiclesLoading) loadVehicles();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [tab]);

  const filteredVehicles = useMemo(() => {
    const kw = vehicleKeyword.trim().toLowerCase();
    if (!kw) return vehicles;
    return vehicles.filter((v) =>
      `${v.licensePlate || ""} ${v.brand || ""} ${v.model || ""} ${v.color || ""}`.toLowerCase().includes(kw),
    );
  }, [vehicles, vehicleKeyword]);

  useEffect(() => { setVehiclePage(1); }, [vehicleKeyword]);
  const pagedVehicles = useMemo(
    () => filteredVehicles.slice((vehiclePage - 1) * VEHICLE_PAGE_SIZE, vehiclePage * VEHICLE_PAGE_SIZE),
    [filteredVehicles, vehiclePage],
  );

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
    const confirmed = await confirmDialog({
      title: "Xóa dịch vụ này?",
      description: "Hành động này không thể hoàn tác.",
      confirmLabel: "Xóa dịch vụ",
      destructive: true,
    });
    if (!confirmed) return;
    try {
      await servicePackageApi.remove(serviceId);
      setServices((prev) => prev.filter(s => (s.id ?? s.serviceId ?? s.servicePackageId) !== serviceId));
      toast.success("Đã xóa dịch vụ.");
    } catch (err) {
      toast.error("Không thể xóa dịch vụ", { description: err?.message });
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
    <PageContainer>
      <PageHeader
        title="Xe &amp; Dịch vụ"
        description="Quản lý gói dịch vụ theo từng gara và danh sách xe của khách hàng."
        actions={
          <>
        {tab === "services" && selectedGarageId && (
          <div className="flex gap-2">
            <Button variant="outline" size="sm" onClick={() => loadServices(selectedGarageId)} className="text-xs text-muted-foreground">
              <RefreshCcw /> Tải lại
            </Button>
            <Button size="sm" onClick={() => { resetForm(); setShowForm(!showForm); }} className="text-xs">
              <Plus /> Thêm dịch vụ
            </Button>
          </div>
        )}
          </>
        }
      />

      {/* Tabs */}
      <div className="flex w-fit gap-1 rounded-xl bg-muted p-1">
        <button
          onClick={() => setTab("services")}
          className={`flex items-center gap-1.5 rounded-lg px-4 py-2 text-xs font-bold transition ${tab === "services" ? "bg-card text-primary shadow-sm" : "text-muted-foreground hover:text-foreground"}`}
        >
          <Package size={14} /> Gói dịch vụ
        </button>
        <button
          onClick={() => setTab("vehicles")}
          className={`flex items-center gap-1.5 rounded-lg px-4 py-2 text-xs font-bold transition ${tab === "vehicles" ? "bg-card text-primary shadow-sm" : "text-muted-foreground hover:text-foreground"}`}
        >
          <Car size={14} /> Xe khách hàng
        </button>
      </div>

      {tab === "vehicles" && (
        <section className="overflow-hidden rounded-2xl border border-border bg-card shadow-sm">
          <div className="flex flex-col gap-3 p-5 pb-3 lg:flex-row lg:items-center lg:justify-between">
            <div className="flex items-center gap-2 text-foreground">
              <Car size={18} className="text-primary" />
              <span className="font-extrabold">{filteredVehicles.length} xe đã đăng ký</span>
            </div>
            <div className="flex items-center gap-3">
              <label className="flex h-10 items-center gap-2 rounded-xl border border-border px-3 lg:w-72">
                <Search size={16} className="text-neutral-muted" />
                <input value={vehicleKeyword} onChange={(e) => setVehicleKeyword(e.target.value)} placeholder="Tìm biển số, hãng, dòng xe..." className="w-full bg-transparent text-sm outline-none" />
              </label>
              <Button variant="outline" onClick={loadVehicles} className="text-xs text-muted-foreground">
                <RefreshCcw className="size-3.5" /> Tải lại
              </Button>
            </div>
          </div>
          {vehiclesLoading ? (
            <p className="py-16 text-center text-sm text-muted-foreground">Đang tải danh sách xe...</p>
          ) : vehiclesError ? (
            <div className="p-10 text-center">
              <AlertTriangle className="mx-auto mb-2 text-critical" size={24} />
              <p className="text-sm font-bold text-critical">{vehiclesError}</p>
              <Button variant="destructive" size="sm" onClick={loadVehicles} className="mt-3">Thử lại</Button>
            </div>
          ) : filteredVehicles.length === 0 ? (
            <div className="py-16 text-center">
              <Car size={40} className="mx-auto text-border" />
              <p className="mt-3 text-sm font-bold text-muted-foreground">Chưa có xe nào được đăng ký</p>
            </div>
          ) : (
            <>
              <div className="overflow-x-auto px-5">
                <table className="w-full min-w-[680px] whitespace-nowrap text-left text-xs">
                  <thead>
                    <tr className="border-b border-border text-xs text-neutral-muted">
                      <th className="px-2 py-3 font-semibold">Biển số</th>
                      <th className="px-2 py-3 font-semibold">Hãng xe</th>
                      <th className="px-2 py-3 font-semibold">Dòng xe</th>
                      <th className="px-2 py-3 font-semibold">Màu sắc</th>
                      <th className="px-2 py-3 font-semibold">Trạng thái</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-border">
                    {pagedVehicles.map((v, i) => (
                      <tr key={v.vehicleId ?? v.id ?? i} className="transition-colors hover:bg-surface">
                        <td className="px-2 py-3">
                          <span className="rounded border border-border bg-muted px-2 py-0.5 font-mono text-xs font-bold text-ink-soft">{v.licensePlate || "—"}</span>
                        </td>
                        <td className="px-2 py-3 font-semibold text-ink-soft">{v.brand || "—"}</td>
                        <td className="px-2 py-3 text-muted-foreground">{v.model || "—"}</td>
                        <td className="px-2 py-3 text-muted-foreground">{v.color || "—"}</td>
                        <td className="px-2 py-3">
                          <span className={`rounded-full px-2.5 py-1 text-xs font-extrabold ${v.status === "ACTIVE" ? "bg-success-container text-success" : "bg-muted text-muted-foreground"}`}>
                            {v.status === "ACTIVE" ? "Đang dùng" : v.status || "—"}
                          </span>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
              <Pagination page={vehiclePage} pageSize={VEHICLE_PAGE_SIZE} total={filteredVehicles.length} onPageChange={setVehiclePage} />
            </>
          )}
        </section>
      )}

      {tab === "services" && (loadingGarages ? (
        <p className="text-sm text-muted-foreground">Đang tải danh sách gara...</p>
      ) : garages.length === 0 ? (
        <div className="rounded-2xl border border-border bg-card p-10 text-center text-sm text-neutral-muted">
          Chưa có gara nào để hiển thị dịch vụ.
        </div>
      ) : (
        <>
          <div className="flex items-center gap-3">
            <label className="text-xs font-bold text-muted-foreground">Chọn gara:</label>
            <select
              value={selectedGarageId}
              onChange={handleGarageChange}
              className="rounded-xl border border-border bg-card px-3 py-2 text-sm outline-none focus:border-primary"
            >
              {garages.map((g) => (
                <option key={g.id ?? g.garageId} value={g.id ?? g.garageId}>
                  {g.name ?? g.garageName ?? `Gara #${g.id ?? g.garageId}`}
                </option>
              ))}
            </select>
          </div>

          {showForm && (
            <form onSubmit={handleSubmit} className="rounded-2xl border border-primary/20 bg-primary-container p-5 space-y-4">
              <h2 className="font-extrabold text-primary-strong">{formData.id ? "Sửa dịch vụ" : "Thêm dịch vụ mới"}</h2>
              {formError && <p className="rounded-lg border border-critical/25 bg-critical-container px-3 py-2 text-xs text-critical">{formError}</p>}
              <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
                <input value={formData.name} onChange={(e) => setFormData({ ...formData, name: e.target.value })} placeholder="Tên dịch vụ *" required className="h-10 rounded-xl border border-border bg-card px-3 text-sm outline-none focus:border-primary" />
                <input value={formData.price} type="number" onChange={(e) => setFormData({ ...formData, price: e.target.value })} placeholder="Giá tiền (VNĐ) *" required className="h-10 rounded-xl border border-border bg-card px-3 text-sm outline-none focus:border-primary" />
                <input value={formData.duration} type="number" onChange={(e) => setFormData({ ...formData, duration: e.target.value })} placeholder="Thời gian (phút)" className="h-10 rounded-xl border border-border bg-card px-3 text-sm outline-none focus:border-primary" />
                <select value={formData.status} onChange={(e) => setFormData({ ...formData, status: e.target.value })} className="h-10 rounded-xl border border-border bg-card px-3 text-sm outline-none focus:border-primary">
                  <option value="ACTIVE">Hoạt động</option>
                  <option value="INACTIVE">Tạm ngưng</option>
                </select>
              </div>
              <input value={formData.description} onChange={(e) => setFormData({ ...formData, description: e.target.value })} placeholder="Mô tả dịch vụ" className="w-full h-10 rounded-xl border border-border bg-card px-3 text-sm outline-none focus:border-primary" />
              
              <div className="flex gap-2">
                <Button type="submit" size="sm" disabled={saving} className="px-5 text-xs">
                  {saving ? "Đang lưu..." : "Lưu dịch vụ"}
                </Button>
                <Button variant="outline" size="sm" onClick={() => setShowForm(false)} className="px-5 text-xs text-muted-foreground">
                  Hủy
                </Button>
              </div>
            </form>
          )}

          {loadingServices ? (
            <p className="rounded-2xl bg-card border border-border py-14 text-center text-sm text-muted-foreground">Đang tải gói dịch vụ...</p>
          ) : services.length === 0 ? (
            <div className="rounded-2xl border border-border bg-card p-12 text-center">
              <p className="text-sm font-semibold text-muted-foreground">Gara này chưa có gói dịch vụ nào.</p>
            </div>
          ) : (
            <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-3">
              {services.map((s) => {
                const sid = s.id ?? s.serviceId ?? s.servicePackageId;
                return (
                  <article key={sid} className="rounded-2xl border border-border bg-card p-5 relative group hover:shadow-card transition-shadow">
                    <div className="absolute top-4 right-4 flex opacity-0 group-hover:opacity-100 transition-opacity gap-2">
                      <Button variant="outline" size="icon-sm" onClick={() => handleEdit(s)} className="text-primary hover:bg-primary-container" title="Sửa">
                        <Pencil className="size-3.5" />
                      </Button>
                      <Button variant="outline" size="icon-sm" onClick={() => handleDelete(sid)} className="text-critical hover:bg-critical-container" title="Xóa">
                        <Trash2 className="size-3.5" />
                      </Button>
                    </div>

                    <div className="pr-16">
                      <b className="text-sm font-extrabold text-foreground">{s.name ?? s.serviceName ?? s.servicePackageName ?? "–"}</b>
                    </div>
                    <p className="mt-3 text-xl font-extrabold text-primary">
                      {new Intl.NumberFormat("vi-VN").format(s.price ?? 0)} đ
                    </p>
                    <p className="mt-1 text-xs text-muted-foreground">⏱ {s.duration ?? s.durationMinutes ?? 0} phút</p>
                    {s.description && (
                      <p className="mt-2 text-xs text-neutral-muted leading-relaxed">{s.description}</p>
                    )}
                    {s.status && (
                      <span className={`mt-3 inline-block rounded-full px-2 py-0.5 text-xs font-bold ${
                        s.status === "ACTIVE" ? "bg-success-container text-success" : "bg-muted text-muted-foreground"
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
      ))}
    </PageContainer>
  );
}
