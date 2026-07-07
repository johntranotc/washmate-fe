import { useCallback, useEffect, useMemo, useState } from "react";
import {
  Package, PackageCheck, PackageX, Car, Search, Plus, RefreshCcw, AlertTriangle,
} from "lucide-react";
import PageContainer from "@/components/shared/PageContainer";
import PageHeader from "@/components/shared/PageHeader";
import Pagination from "../../components/common/Pagination";
import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";
import { toast } from "@/components/ui/toast";
import { confirmDialog } from "@/components/shared/ConfirmDialog";
import { garageApi } from "../../api/garageApi";
import { adminApi } from "../../api/adminApi";
import { vehicleApi } from "../../api/vehicleApi";
import { servicePackageApi } from "../../api/servicePackageApi";
import { normalizeBookingList, normalizeStaffBooking } from "../../lib/staff-booking-data";
import { todayISO, formatMoney, formatDate, formatNumber, friendlyName } from "../../lib/format";
import { cn } from "@/lib/utils";
import { ServiceFormModal } from "../../components/admin/services/ServiceFormModal";
import { AdminServiceDrawer } from "../../components/admin/services/AdminServiceDrawer";
import { AdminVehicleDrawer } from "../../components/admin/services/AdminVehicleDrawer";

const VEHICLE_PAGE_SIZE = 10;

const SORT_OPTIONS = [
  ["recent", "Mới cập nhật"],
  ["priceAsc", "Giá thấp đến cao"],
  ["priceDesc", "Giá cao đến thấp"],
  ["popular", "Phổ biến"],
];

const VEHICLE_STATUS_LABELS = { ACTIVE: "Đang sử dụng", INACTIVE: "Ngưng sử dụng" };

function isoAddDays(iso, delta) {
  const d = new Date(`${iso}T00:00:00`);
  d.setDate(d.getDate() + delta);
  return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, "0")}-${String(d.getDate()).padStart(2, "0")}`;
}

function ServicesSkeleton() {
  return (
    <div className="space-y-6">
      <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
        {Array.from({ length: 4 }, (_, i) => <Skeleton key={i} className="h-24 rounded-2xl" />)}
      </div>
      <Skeleton className="h-20 rounded-2xl" />
      <div className="grid gap-4 lg:grid-cols-2 xl:grid-cols-3">
        {Array.from({ length: 6 }, (_, i) => <Skeleton key={i} className="h-56 rounded-2xl" />)}
      </div>
    </div>
  );
}

/**
 * Trang Xe & Dịch vụ (Admin) — dữ liệu thật:
 *   dịch vụ: GET /v1/services/garage/{id} (tải song song mọi gara), CRUD thật
 *   xe khách: GET /v1/vehicles + chủ xe từ GET /admin/users
 *   số booking/lần ghé: tính từ GET /bookings
 */
export default function AdminServicePage() {
  const [garages, setGarages] = useState([]);
  const [services, setServices] = useState([]);
  const [vehicles, setVehicles] = useState([]);
  const [users, setUsers] = useState([]);
  const [bookings, setBookings] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [lastUpdated, setLastUpdated] = useState(null);

  const [tab, setTab] = useState("services");
  // Filter dịch vụ
  const [garageFilter, setGarageFilter] = useState("all");
  const [serviceKeyword, setServiceKeyword] = useState("");
  const [statusFilter, setStatusFilter] = useState("ALL");
  const [sortKey, setSortKey] = useState("recent");
  // Filter xe
  const [vehicleKeyword, setVehicleKeyword] = useState("");
  const [vehicleGarage, setVehicleGarage] = useState("all");
  const [vehicleStatus, setVehicleStatus] = useState("ALL");
  const [vehicleBrand, setVehicleBrand] = useState("all");
  const [vehiclePage, setVehiclePage] = useState(1);

  const [formTarget, setFormTarget] = useState(null); // { service | null } khi mở form
  const [serviceDetail, setServiceDetail] = useState(null);
  const [vehicleDetail, setVehicleDetail] = useState(null);
  const [busyId, setBusyId] = useState(null);

  const load = useCallback(async () => {
    setLoading(true);
    setError(null);
    const [gRes, vRes, uRes, bRes] = await Promise.allSettled([
      garageApi.getAll(),
      vehicleApi.getAllVehicles(),
      adminApi.getAllUsers({ size: 1000 }),
      adminApi.getBookings({ size: 1000 }),
    ]);
    const garageList = gRes.status === "fulfilled" && Array.isArray(gRes.value) ? gRes.value : [];
    setGarages(garageList);
    setVehicles(vRes.status === "fulfilled" && Array.isArray(vRes.value) ? vRes.value : []);
    const userPage = uRes.status === "fulfilled" ? uRes.value : null;
    setUsers(Array.isArray(userPage?.content) ? userPage.content : Array.isArray(userPage) ? userPage : []);
    setBookings(bRes.status === "fulfilled" ? normalizeBookingList(bRes.value).map(normalizeStaffBooking) : []);

    if (gRes.status === "rejected") {
      setError(gRes.reason?.message || "Không thể tải danh sách gara.");
      setServices([]);
      setLoading(false);
      return;
    }

    // Tải dịch vụ của TẤT CẢ gara song song (endpoint thật theo từng gara)
    const results = await Promise.allSettled(
      garageList.map((g) => servicePackageApi.getAll(g.id ?? g.garageId)),
    );
    const all = [];
    results.forEach((r, i) => {
      if (r.status !== "fulfilled") return;
      const list = Array.isArray(r.value) ? r.value : [];
      const garage = garageList[i];
      list.forEach((s) => all.push({
        id: s.servicePackageId ?? s.id,
        garageId: s.garageId ?? garage.id ?? garage.garageId,
        name: s.name,
        description: s.description,
        price: Number(s.price || 0),
        durationMinutes: s.durationMinutes ?? s.duration,
        status: s.status || "ACTIVE",
        createdAt: s.createdAt || null,
        garageName: garage.name ?? garage.garageName,
      }));
    });
    setServices(all);
    setLastUpdated(new Date());
    setLoading(false);
  }, []);

  useEffect(() => { load(); }, [load]);
  useEffect(() => { setVehiclePage(1); }, [vehicleKeyword, vehicleGarage, vehicleStatus, vehicleBrand, vehicles]);

  // ===== Enrich dịch vụ với booking 30 ngày (từ GET /bookings) =====
  const enrichedServices = useMemo(() => {
    const from30 = isoAddDays(todayISO(), -29);
    const stats = new Map(); // serviceId -> { count, revenue }
    bookings.forEach((b) => {
      const sid = b.service?.id;
      if (sid == null || !b.bookingDate || b.bookingDate < from30) return;
      const cur = stats.get(String(sid)) || { count: 0, revenue: 0 };
      cur.count += 1;
      if (b.bookingStatus === "COMPLETED") cur.revenue += b.finalAmount || 0;
      stats.set(String(sid), cur);
    });
    return services.map((s) => ({
      ...s,
      bookings30d: stats.get(String(s.id))?.count || 0,
      revenue30d: stats.get(String(s.id))?.revenue || 0,
    }));
  }, [services, bookings]);

  const filteredServices = useMemo(() => {
    const kw = serviceKeyword.trim().toLowerCase();
    const list = enrichedServices.filter((s) => {
      if (garageFilter !== "all" && String(s.garageId) !== String(garageFilter)) return false;
      if (statusFilter !== "ALL" && s.status !== statusFilter) return false;
      if (kw && !`${s.name || ""} DV-${s.id} ${s.description || ""}`.toLowerCase().includes(kw)) return false;
      return true;
    });
    const sorters = {
      recent: (a, b) => (b.createdAt || "").localeCompare(a.createdAt || "") || b.id - a.id,
      priceAsc: (a, b) => a.price - b.price,
      priceDesc: (a, b) => b.price - a.price,
      popular: (a, b) => b.bookings30d - a.bookings30d,
    };
    return [...list].sort(sorters[sortKey] || sorters.recent);
  }, [enrichedServices, garageFilter, statusFilter, serviceKeyword, sortKey]);

  // ===== Enrich xe với chủ xe + lịch sử booking (theo biển số) =====
  const enrichedVehicles = useMemo(() => {
    const usersById = new Map(users.map((u) => [String(u.id), u]));
    const byPlate = new Map();
    bookings.forEach((b) => {
      if (!b.plate) return;
      if (!byPlate.has(b.plate)) byPlate.set(b.plate, []);
      byPlate.get(b.plate).push(b);
    });
    return vehicles.map((v) => {
      const myBookings = (byPlate.get(v.licensePlate) || [])
        .sort((a, b) => (b.bookingDate || "").localeCompare(a.bookingDate || ""));
      const garageCount = new Map();
      myBookings.forEach((b) => {
        const name = friendlyName(b.garageName, "");
        if (name) garageCount.set(name, (garageCount.get(name) || 0) + 1);
      });
      const topGarage = [...garageCount.entries()].sort((a, b) => b[1] - a[1])[0]?.[0] || null;
      return {
        ...v,
        owner: usersById.get(String(v.userId)) || null,
        bookings: myBookings,
        totals: {
          count: myBookings.length,
          lastDate: myBookings[0]?.bookingDate || null,
          topGarage,
        },
      };
    });
  }, [vehicles, users, bookings]);

  const vehicleBrands = useMemo(
    () => [...new Set(enrichedVehicles.map((v) => (v.brand || "").trim()).filter(Boolean))].sort(),
    [enrichedVehicles],
  );

  const filteredVehicles = useMemo(() => {
    const kw = vehicleKeyword.trim().toLowerCase();
    return enrichedVehicles.filter((v) => {
      if (vehicleStatus !== "ALL" && v.status !== vehicleStatus) return false;
      if (vehicleBrand !== "all" && (v.brand || "").trim() !== vehicleBrand) return false;
      if (vehicleGarage !== "all") {
        const gName = garages.find((g) => String(g.id ?? g.garageId) === String(vehicleGarage))?.name;
        if (!v.bookings.some((b) => b.garageName === gName)) return false;
      }
      if (kw) {
        const hay = `${v.licensePlate || ""} ${v.owner?.fullName || ""} ${v.owner?.phone || ""} ${v.brand || ""} ${v.model || ""}`.toLowerCase();
        if (!hay.includes(kw)) return false;
      }
      return true;
    });
  }, [enrichedVehicles, vehicleKeyword, vehicleStatus, vehicleBrand, vehicleGarage, garages]);

  const pagedVehicles = useMemo(
    () => filteredVehicles.slice((vehiclePage - 1) * VEHICLE_PAGE_SIZE, vehiclePage * VEHICLE_PAGE_SIZE),
    [filteredVehicles, vehiclePage],
  );

  // KPI — dịch vụ theo gara đang lọc; xe = toàn hệ thống
  const kpis = useMemo(() => {
    const scoped = garageFilter === "all"
      ? enrichedServices
      : enrichedServices.filter((s) => String(s.garageId) === String(garageFilter));
    return {
      total: scoped.length,
      active: scoped.filter((s) => s.status === "ACTIVE").length,
      inactive: scoped.filter((s) => s.status !== "ACTIVE").length,
      vehicles: vehicles.length,
    };
  }, [enrichedServices, garageFilter, vehicles]);

  const KPI_CARDS = [
    { key: "total", label: "Tổng dịch vụ", Icon: Package, tone: "text-primary bg-primary-container" },
    { key: "active", label: "Đang hoạt động", Icon: PackageCheck, tone: "text-success bg-success-container" },
    { key: "inactive", label: "Tạm ẩn", Icon: PackageX, tone: "text-muted-foreground bg-muted" },
    { key: "vehicles", label: "Xe khách hàng", Icon: Car, tone: "text-accent-violet bg-accent-violet/10" },
  ];

  // Tạm ẩn / kích hoạt — confirm rồi PUT /v1/services/{id} với status mới.
  async function handleToggleStatus(service) {
    const hiding = service.status === "ACTIVE";
    const ok = await confirmDialog({
      title: hiding ? "Tạm ẩn dịch vụ này?" : "Kích hoạt dịch vụ này?",
      description: hiding
        ? "Dịch vụ sẽ không còn hiển thị cho khách hàng đặt lịch."
        : "Dịch vụ sẽ được hiển thị lại cho khách hàng đặt lịch.",
      confirmLabel: hiding ? "Xác nhận tạm ẩn" : "Kích hoạt",
      destructive: hiding,
    });
    if (!ok) return;
    setBusyId(service.id);
    try {
      await servicePackageApi.update(service.id, {
        name: service.name,
        description: service.description,
        price: service.price,
        durationMinutes: service.durationMinutes,
        status: hiding ? "INACTIVE" : "ACTIVE",
      });
      toast.success(hiding ? "Đã tạm ẩn dịch vụ" : "Đã kích hoạt dịch vụ", { description: service.name });
      load();
    } catch (e) {
      toast.error("Thao tác thất bại", { description: e?.message || "Lỗi không xác định" });
    } finally {
      setBusyId(null);
    }
  }

  const updatedLabel = lastUpdated
    ? lastUpdated.toLocaleTimeString("vi-VN", { hour: "2-digit", minute: "2-digit", second: "2-digit" })
    : null;

  const serviceHasFilter = serviceKeyword.trim() !== "" || statusFilter !== "ALL" || garageFilter !== "all";
  const vehicleHasFilter = vehicleKeyword.trim() !== "" || vehicleStatus !== "ALL" || vehicleBrand !== "all" || vehicleGarage !== "all";

  return (
    <PageContainer>
      <PageHeader
        eyebrow="Quản trị hệ thống"
        title="Xe & Dịch vụ"
        description="Quản lý gói dịch vụ theo từng gara và danh sách xe của khách hàng."
        actions={
          <div className="flex flex-wrap items-center gap-2">
            <Button variant="outline" size="sm" onClick={load} disabled={loading}>
              <RefreshCcw className={loading ? "animate-spin" : ""} /> Tải lại
            </Button>
            <Button size="sm" onClick={() => setFormTarget({ service: null })}>
              <Plus /> Thêm dịch vụ
            </Button>
            {updatedLabel && (
              <span className="text-xs font-medium text-muted-foreground">Cập nhật lúc {updatedLabel}</span>
            )}
          </div>
        }
      />

      {loading && !services.length && !vehicles.length ? (
        <ServicesSkeleton />
      ) : error && !services.length ? (
        <div className="rounded-2xl border border-critical/25 bg-critical-container p-8 text-center">
          <AlertTriangle className="mx-auto mb-3 text-critical" size={28} />
          <p className="text-sm font-bold text-critical">{error}</p>
          <Button size="sm" onClick={load} className="mt-4 bg-critical text-white hover:bg-critical/90">Thử lại</Button>
        </div>
      ) : (
        <>
          {/* KPI */}
          <section className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
            {KPI_CARDS.map(({ key, label, Icon, tone }) => (
              <article key={key} className="flex items-center gap-3 rounded-2xl border border-border bg-card p-4">
                <span className={`grid h-10 w-10 shrink-0 place-items-center rounded-xl ${tone}`}>
                  <Icon size={18} />
                </span>
                <div>
                  <p className="text-xs font-semibold text-muted-foreground">{label}</p>
                  <b className="mt-0.5 block text-xl font-semibold text-foreground">{formatNumber(kpis[key])}</b>
                </div>
              </article>
            ))}
          </section>

          {/* 2 tab chính */}
          <div className="flex gap-1 rounded-xl border border-border bg-card p-1 sm:w-fit">
            {[
              ["services", `Gói dịch vụ (${enrichedServices.length})`],
              ["vehicles", `Xe khách hàng (${vehicles.length})`],
            ].map(([key, label]) => (
              <button
                key={key}
                type="button"
                onClick={() => setTab(key)}
                className={cn(
                  "flex-1 rounded-lg px-4 py-2 text-xs font-bold transition sm:flex-none",
                  tab === key ? "bg-primary text-white" : "text-muted-foreground hover:text-foreground",
                )}
              >
                {label}
              </button>
            ))}
          </div>

          {tab === "services" ? (
            <>
              {/* Toolbar dịch vụ */}
              <section className="flex flex-wrap items-center gap-3 rounded-2xl border border-border bg-card p-4">
                <select
                  value={garageFilter}
                  onChange={(e) => setGarageFilter(e.target.value)}
                  className="h-10 rounded-xl border border-input bg-background px-3 text-xs font-bold outline-none focus:border-ring"
                  aria-label="Chọn gara"
                >
                  <option value="all">Tất cả gara</option>
                  {garages.map((g) => (
                    <option key={g.id ?? g.garageId} value={g.id ?? g.garageId}>
                      {friendlyName(g.name ?? g.garageName, "Gara chưa cập nhật")}
                    </option>
                  ))}
                </select>
                <label className="flex h-10 min-w-[200px] flex-1 items-center gap-2 rounded-xl border border-border px-3 lg:max-w-sm">
                  <Search size={16} className="text-neutral-muted" />
                  <input
                    value={serviceKeyword}
                    onChange={(e) => setServiceKeyword(e.target.value)}
                    placeholder="Tìm theo tên dịch vụ, mã, mô tả..."
                    className="w-full bg-transparent text-sm outline-none"
                  />
                </label>
                <select
                  value={statusFilter}
                  onChange={(e) => setStatusFilter(e.target.value)}
                  className="h-10 rounded-xl border border-input bg-background px-3 text-xs font-bold outline-none focus:border-ring"
                  aria-label="Lọc trạng thái"
                >
                  <option value="ALL">Tất cả trạng thái</option>
                  <option value="ACTIVE">Đang hoạt động</option>
                  <option value="INACTIVE">Tạm ẩn</option>
                </select>
                <select
                  value={sortKey}
                  onChange={(e) => setSortKey(e.target.value)}
                  className="h-10 rounded-xl border border-input bg-background px-3 text-xs font-bold outline-none focus:border-ring"
                  aria-label="Sắp xếp"
                >
                  {SORT_OPTIONS.map(([v, l]) => <option key={v} value={v}>{l}</option>)}
                </select>
              </section>

              {/* Grid card dịch vụ */}
              {filteredServices.length === 0 ? (
                <div className="rounded-2xl border border-border bg-card px-6 py-14 text-center">
                  <Package size={40} className="mx-auto text-border" />
                  <p className="mt-3 text-sm font-semibold text-foreground">
                    {serviceHasFilter ? "Không có dịch vụ phù hợp bộ lọc." : "Chưa có dịch vụ nào trong gara này."}
                  </p>
                  <p className="mt-1 text-xs text-muted-foreground">
                    {serviceHasFilter ? "Thử thay đổi bộ lọc hoặc từ khóa." : "Bấm \"Thêm dịch vụ\" để tạo gói đầu tiên."}
                  </p>
                </div>
              ) : (
                <div className="grid gap-4 lg:grid-cols-2 xl:grid-cols-3">
                  {filteredServices.map((s) => {
                    const active = s.status === "ACTIVE";
                    const busy = busyId === s.id;
                    return (
                      <article key={s.id} className="flex flex-col rounded-2xl border border-border bg-card p-5">
                        <div className="flex items-start justify-between gap-2">
                          <h3 className="text-sm font-bold text-foreground">
                            {friendlyName(s.name, "Dịch vụ chưa cập nhật")}
                          </h3>
                          <span className={`shrink-0 rounded-full px-2.5 py-0.5 text-xs font-bold ${
                            active ? "bg-success-container text-success" : "bg-muted text-muted-foreground"
                          }`}
                          >
                            {active ? "Đang hoạt động" : "Tạm ẩn"}
                          </span>
                        </div>
                        <p className="mt-1 text-lg font-semibold text-primary">{formatMoney(s.price)}</p>
                        <p className="mt-0.5 text-xs text-muted-foreground">
                          {s.durationMinutes ? `${s.durationMinutes} phút` : "—"}
                          {" · "}{formatNumber(s.bookings30d)} booking 30 ngày
                        </p>
                        <p className="mt-2 line-clamp-2 min-h-8 text-xs leading-4 text-muted-foreground">
                          {friendlyName(s.description, "Mô tả chưa cập nhật")}
                        </p>
                        <div className="mt-3 flex flex-wrap items-center gap-1.5 text-xs">
                          <span className="rounded-full bg-primary-container px-2.5 py-0.5 font-bold text-primary-strong">
                            Áp dụng: {friendlyName(s.garageName, "Gara chưa cập nhật")}
                          </span>
                          {s.createdAt && (
                            <span className="text-neutral-muted">Tạo: {formatDate(s.createdAt)}</span>
                          )}
                        </div>
                        <div className="mt-4 flex flex-wrap gap-1.5 border-t border-border pt-3">
                          <Button size="sm" variant="outline" onClick={() => setServiceDetail(s)}>Chi tiết</Button>
                          <Button size="sm" variant="outline" onClick={() => setFormTarget({ service: s })}>Chỉnh sửa</Button>
                          <Button
                            size="sm"
                            variant={active ? "destructive" : "default"}
                            disabled={busy}
                            onClick={() => handleToggleStatus(s)}
                          >
                            {busy ? "..." : active ? "Tạm ẩn" : "Kích hoạt"}
                          </Button>
                        </div>
                      </article>
                    );
                  })}
                </div>
              )}
            </>
          ) : (
            <>
              {/* Toolbar xe khách hàng */}
              <section className="flex flex-wrap items-center gap-3 rounded-2xl border border-border bg-card p-4">
                <label className="flex h-10 min-w-[200px] flex-1 items-center gap-2 rounded-xl border border-border px-3 lg:max-w-sm">
                  <Search size={16} className="text-neutral-muted" />
                  <input
                    value={vehicleKeyword}
                    onChange={(e) => setVehicleKeyword(e.target.value)}
                    placeholder="Tìm biển số, tên khách, SĐT..."
                    className="w-full bg-transparent text-sm outline-none"
                  />
                </label>
                <select
                  value={vehicleGarage}
                  onChange={(e) => setVehicleGarage(e.target.value)}
                  className="h-10 rounded-xl border border-input bg-background px-3 text-xs font-bold outline-none focus:border-ring"
                  aria-label="Lọc gara"
                  title="Xe có booking tại gara"
                >
                  <option value="all">Tất cả gara</option>
                  {garages.map((g) => (
                    <option key={g.id ?? g.garageId} value={g.id ?? g.garageId}>
                      {friendlyName(g.name ?? g.garageName, "Gara chưa cập nhật")}
                    </option>
                  ))}
                </select>
                <select
                  value={vehicleStatus}
                  onChange={(e) => setVehicleStatus(e.target.value)}
                  className="h-10 rounded-xl border border-input bg-background px-3 text-xs font-bold outline-none focus:border-ring"
                  aria-label="Lọc trạng thái xe"
                >
                  <option value="ALL">Tất cả trạng thái</option>
                  <option value="ACTIVE">Đang sử dụng</option>
                  <option value="INACTIVE">Ngưng sử dụng</option>
                </select>
                <select
                  value={vehicleBrand}
                  onChange={(e) => setVehicleBrand(e.target.value)}
                  className="h-10 rounded-xl border border-input bg-background px-3 text-xs font-bold outline-none focus:border-ring"
                  aria-label="Lọc hãng xe"
                >
                  <option value="all">Tất cả hãng xe</option>
                  {vehicleBrands.map((b) => <option key={b} value={b}>{b}</option>)}
                </select>
              </section>

              {/* Bảng xe */}
              <section className="rounded-2xl border border-border bg-card">
                <div className="p-5 pb-3">
                  <h2 className="text-lg font-bold text-foreground">Xe khách hàng</h2>
                  <p className="mt-0.5 text-xs text-muted-foreground">
                    Hiển thị {pagedVehicles.length} / {filteredVehicles.length} xe
                  </p>
                </div>
                {filteredVehicles.length === 0 ? (
                  <div className="px-6 py-14 text-center">
                    <Car size={40} className="mx-auto text-border" />
                    <p className="mt-3 text-sm font-semibold text-foreground">Chưa có xe khách hàng phù hợp.</p>
                    <p className="mt-1 text-xs text-muted-foreground">
                      {vehicleHasFilter ? "Thử thay đổi bộ lọc hoặc từ khóa." : "Xe của khách sẽ hiện tại đây."}
                    </p>
                  </div>
                ) : (
                  <>
                    <div className="overflow-x-auto px-5">
                      <table className="w-full min-w-[1000px] text-left text-xs">
                        <thead>
                          <tr className="border-b border-border font-semibold text-neutral-muted">
                            <th className="py-3 pr-3 font-semibold">Biển số</th>
                            <th className="py-3 pr-3 font-semibold">Khách hàng</th>
                            <th className="py-3 pr-3 font-semibold">SĐT</th>
                            <th className="py-3 pr-3 font-semibold">Dòng xe</th>
                            <th className="py-3 pr-3 font-semibold">Gara</th>
                            <th className="py-3 pr-3 font-semibold">Lần booking</th>
                            <th className="py-3 pr-3 font-semibold">Ghé gần nhất</th>
                            <th className="py-3 pr-3 font-semibold">Trạng thái</th>
                            <th className="py-3 text-right font-semibold">Thao tác</th>
                          </tr>
                        </thead>
                        <tbody className="divide-y divide-surface">
                          {pagedVehicles.map((v) => (
                            <tr key={v.vehicleId ?? v.licensePlate} className="align-middle hover:bg-surface">
                              <td className="py-3 pr-3 font-bold text-foreground">{v.licensePlate || "Xe chưa cập nhật"}</td>
                              <td className="max-w-[160px] truncate py-3 pr-3 font-semibold text-ink-soft">
                                {friendlyName(v.owner?.fullName, "Khách hàng chưa cập nhật")}
                              </td>
                              <td className="py-3 pr-3 text-muted-foreground">
                                {friendlyName(v.owner?.phone, "SĐT chưa cập nhật")}
                              </td>
                              <td className="max-w-[140px] truncate py-3 pr-3 text-muted-foreground">
                                {[v.brand, v.model].filter(Boolean).join(" ") || "—"}
                              </td>
                              <td className="max-w-[140px] truncate py-3 pr-3 text-muted-foreground">
                                {friendlyName(v.totals.topGarage, "Chưa có booking")}
                              </td>
                              <td className="py-3 pr-3 font-bold text-foreground">{formatNumber(v.totals.count)}</td>
                              <td className="py-3 pr-3 text-muted-foreground">
                                {v.totals.lastDate ? formatDate(v.totals.lastDate) : "—"}
                              </td>
                              <td className="py-3 pr-3">
                                <span className={`rounded-full px-2.5 py-0.5 font-bold ${
                                  v.status === "ACTIVE" ? "bg-success-container text-success" : "bg-muted text-muted-foreground"
                                }`}
                                >
                                  {VEHICLE_STATUS_LABELS[v.status] || v.status || "—"}
                                </span>
                              </td>
                              <td className="py-3 text-right">
                                <Button size="sm" variant="outline" onClick={() => setVehicleDetail(v)}>
                                  Chi tiết
                                </Button>
                              </td>
                            </tr>
                          ))}
                        </tbody>
                      </table>
                    </div>
                    <Pagination
                      page={vehiclePage}
                      pageSize={VEHICLE_PAGE_SIZE}
                      total={filteredVehicles.length}
                      onPageChange={setVehiclePage}
                    />
                  </>
                )}
              </section>
            </>
          )}
        </>
      )}

      <ServiceFormModal
        service={formTarget?.service || null}
        garages={garages}
        open={Boolean(formTarget)}
        onOpenChange={(open) => { if (!open) setFormTarget(null); }}
        onDone={load}
      />
      <AdminServiceDrawer
        service={serviceDetail}
        open={Boolean(serviceDetail)}
        onOpenChange={(open) => { if (!open) setServiceDetail(null); }}
      />
      <AdminVehicleDrawer
        vehicle={vehicleDetail}
        open={Boolean(vehicleDetail)}
        onOpenChange={(open) => { if (!open) setVehicleDetail(null); }}
      />
    </PageContainer>
  );
}
