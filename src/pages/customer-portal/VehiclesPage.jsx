import { useCallback, useEffect, useMemo, useState } from "react";
import { useNavigate } from "react-router-dom";
import { AlertTriangle, Car, CheckCircle2, ClipboardCheck, History, Plus, Search } from "lucide-react";
import PageContainer from "@/components/shared/PageContainer";
import PageHeader from "@/components/shared/PageHeader";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Skeleton } from "@/components/ui/skeleton";
import { KpiCard } from "@/components/shared/KpiCard";
import { EmptyState } from "@/components/shared/EmptyState";
import Pagination from "@/components/common/Pagination";
import { toast } from "@/components/ui/toast";
import { confirmDialog } from "@/components/shared/ConfirmDialog";
import { VehicleCard } from "@/components/customer-portal/vehicle-card";
import { VehicleDetailDrawer } from "@/components/customer-portal/vehicle-detail-drawer";
import { VehicleFormDialog } from "@/components/customer-portal/vehicle-form-dialog";
import { vehicleApi } from "@/api/vehicleApi";
import { loadCustomerBookingList } from "@/lib/customer-bookings";
import { normalizeVehicle } from "@/lib/booking-flow";
import { friendlyError } from "@/lib/api-error";
import { isUpcoming } from "@/lib/customer-booking-status";
import { formatBookingDate } from "@/lib/customer-booking-data";
import {
  buildVehicleStats,
  isActiveVehicle,
  normalizeVehicleList,
  vehicleDisplayName,
  vehicleNeedsUpdate,
} from "@/lib/customer-vehicle-data";

const PAGE_SIZE = 6;
const DRAFT_KEY = "washmate_booking_draft";

const TABS = [
  { key: "all", label: "Tất cả", match: () => true },
  { key: "active", label: "Đang sử dụng", match: isActiveVehicle },
  { key: "inactive", label: "Tạm ẩn", match: (v) => v.status === "INACTIVE" },
  { key: "needsUpdate", label: "Cần cập nhật", match: vehicleNeedsUpdate },
];

const selectClass =
  "h-9 rounded-lg border border-border bg-card px-2.5 text-sm font-semibold text-foreground outline-none focus-visible:border-ring";

export default function VehiclesPage() {
  const navigate = useNavigate();

  const [vehicles, setVehicles] = useState([]);
  const [bookings, setBookings] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(false);

  const [search, setSearch] = useState("");
  const [tab, setTab] = useState("all");
  const [sort, setSort] = useState("newest");
  const [page, setPage] = useState(1);

  const [detailVehicle, setDetailVehicle] = useState(null);
  const [form, setForm] = useState({ open: false, mode: "add", vehicle: null });
  const [submitting, setSubmitting] = useState(false);

  const load = useCallback(async () => {
    setLoading(true);
    setError(false);
    const [vRes, bRes] = await Promise.allSettled([vehicleApi.getMyVehicles(), loadCustomerBookingList()]);
    if (vRes.status === "fulfilled") {
      setVehicles(normalizeVehicleList(vRes.value));
    } else {
      setError(true);
    }
    setBookings(bRes.status === "fulfilled" ? bRes.value.bookings : []);
    setLoading(false);
  }, []);

  useEffect(() => {
    load();
  }, [load]);

  const stats = useMemo(() => buildVehicleStats(vehicles, bookings), [vehicles, bookings]);

  const kpi = useMemo(() => {
    const lastCare = vehicles
      .map((v) => stats[v.id]?.lastService?.date)
      .filter(Boolean)
      .sort((a, b) => String(b).localeCompare(String(a)))[0];
    return {
      total: vehicles.length,
      active: vehicles.filter(isActiveVehicle).length,
      needsUpdate: vehicles.filter(vehicleNeedsUpdate).length,
      lastCare: lastCare ? formatBookingDate(lastCare) : "Chưa có",
    };
  }, [vehicles, stats]);

  const tabCounts = useMemo(() => {
    const counts = {};
    for (const t of TABS) counts[t.key] = vehicles.filter(t.match).length;
    return counts;
  }, [vehicles]);

  const filtered = useMemo(() => {
    const activeTab = TABS.find((t) => t.key === tab) || TABS[0];
    const q = search.trim().toLowerCase();
    const list = vehicles.filter((v) => {
      if (!activeTab.match(v)) return false;
      if (!q) return true;
      return [v.licensePlate, v.brand, v.model, vehicleDisplayName(v)]
        .filter(Boolean)
        .some((s) => String(s).toLowerCase().includes(q));
    });
    const byNewest = (a, b) => String(b.createdAt || "").localeCompare(String(a.createdAt || ""));
    list.sort((a, b) => {
      if (sort === "oldest") return -byNewest(a, b);
      if (sort === "lastCare") {
        return String(stats[b.id]?.lastService?.date || "").localeCompare(String(stats[a.id]?.lastService?.date || ""));
      }
      if (sort === "mostBookings") return (stats[b.id]?.totalBookings || 0) - (stats[a.id]?.totalBookings || 0);
      return byNewest(a, b);
    });
    return list;
  }, [vehicles, tab, search, sort, stats]);

  useEffect(() => setPage(1), [tab, search, sort]);

  const totalPages = Math.max(1, Math.ceil(filtered.length / PAGE_SIZE));
  const safePage = Math.min(page, totalPages);
  const pageItems = filtered.slice((safePage - 1) * PAGE_SIZE, safePage * PAGE_SIZE);

  // ---- Actions (API thật) ----

  const vehicleHasUpcoming = useCallback(
    (v) => bookings.some((b) => (b.plate || "").toUpperCase() === v.licensePlate && isUpcoming(b)),
    [bookings],
  );

  const handleBook = useCallback(
    (vehicle) => {
      try {
        const draft = JSON.parse(sessionStorage.getItem(DRAFT_KEY) || "null") || {};
        draft.selection = { ...(draft.selection || {}), vehicle: normalizeVehicle({ vehicleId: vehicle.id, ...vehicle }) };
        sessionStorage.setItem(DRAFT_KEY, JSON.stringify(draft));
      } catch {
        /* seed draft là tùy chọn — luồng đặt lịch vẫn hoạt động nếu ghi thất bại */
      }
      navigate("/khach-hang/dat-lich-moi");
    },
    [navigate],
  );

  const handleSubmitForm = useCallback(
    async (payload) => {
      setSubmitting(true);
      try {
        if (form.mode === "edit" && form.vehicle) {
          await vehicleApi.updateVehicle(form.vehicle.id, { ...payload, status: form.vehicle.status || "ACTIVE" });
          toast.success("Đã cập nhật thông tin xe.");
        } else {
          await vehicleApi.createVehicle(payload);
          toast.success("Đã thêm xe mới.");
        }
        setForm({ open: false, mode: "add", vehicle: null });
        await load();
      } catch (err) {
        toast.error("Không lưu được thông tin xe.", { description: friendlyError(err, "Vui lòng thử lại sau.") });
      } finally {
        setSubmitting(false);
      }
    },
    [form, load],
  );

  const handleToggleStatus = useCallback(
    async (vehicle) => {
      const next = isActiveVehicle(vehicle) ? "INACTIVE" : "ACTIVE";
      try {
        await vehicleApi.updateVehicle(vehicle.id, {
          licensePlate: vehicle.licensePlate,
          brand: vehicle.brand,
          model: vehicle.model,
          color: vehicle.color,
          status: next,
        });
        toast.success(next === "INACTIVE" ? "Đã tạm ẩn xe." : "Đã kích hoạt lại xe.");
        await load();
      } catch (err) {
        toast.error("Không đổi được trạng thái xe.", { description: friendlyError(err, "Vui lòng thử lại sau.") });
      }
    },
    [load],
  );

  const handleDelete = useCallback(
    async (vehicle) => {
      if (vehicleHasUpcoming(vehicle)) {
        toast.error("Xe đang có lịch đặt sắp tới.", {
          description: "Không thể xóa cho đến khi lịch được hoàn tất hoặc hủy.",
        });
        return;
      }
      const ok = await confirmDialog({
        title: "Bạn có chắc muốn xóa xe này?",
        description:
          "Xe sẽ không còn hiển thị trong danh sách phương tiện của bạn. Các lịch đặt cũ vẫn được giữ trong lịch sử.",
        confirmLabel: "Xóa xe",
        destructive: true,
      });
      if (!ok) return;
      try {
        await vehicleApi.deleteVehicle(vehicle.id);
        // Xóa thành công → gỡ khỏi danh sách ngay. KHÔNG refetch vì danh sách của BE
        // hiện trả về cả xe đã xóa (chưa lọc deletedAt) sẽ khiến xe hiện lại.
        setVehicles((prev) => prev.filter((v) => v.id !== vehicle.id));
        setDetailVehicle(null);
        toast.success("Đã xóa xe.");
      } catch (err) {
        toast.error("Chưa thể xóa xe này.", {
          description: friendlyError(err, "Bạn có thể chọn “Tạm ẩn xe” để ẩn khỏi danh sách."),
        });
      }
    },
    [vehicleHasUpcoming],
  );

  const handleSetDefault = useCallback(() => {
    toast.info("Đặt xe mặc định sẽ sớm được hỗ trợ.");
  }, []);

  return (
    <PageContainer variant="customer" className="pb-32">
      <PageHeader
        title="Xe của tôi"
        description="Quản lý danh sách phương tiện để đặt lịch nhanh hơn và theo dõi lịch sử chăm sóc dễ dàng."
        actions={
          <Button size="lg" className="shadow-cta" onClick={() => setForm({ open: true, mode: "add", vehicle: null })}>
            <Plus size={18} /> Thêm xe mới
          </Button>
        }
      />

      {/* KPI */}
      <div className="grid grid-cols-2 gap-3 lg:grid-cols-4">
        <KpiCard label="Tổng phương tiện" value={loading ? "—" : kpi.total} icon={<Car size={18} />} />
        <KpiCard
          label="Đang sử dụng"
          value={loading ? "—" : kpi.active}
          icon={<CheckCircle2 size={18} />}
          tone="bg-success-container text-success"
        />
        <KpiCard
          label="Cần cập nhật"
          value={loading ? "—" : kpi.needsUpdate}
          icon={<ClipboardCheck size={18} />}
          tone="bg-warning-container text-warning"
          highlight={!loading && kpi.needsUpdate > 0}
        />
        <KpiCard
          label="Chăm sóc gần nhất"
          value={loading ? "—" : kpi.lastCare}
          icon={<History size={18} />}
          tone="bg-primary-container text-primary"
        />
      </div>

      {/* Toolbar */}
      <div className="flex flex-col gap-3 lg:flex-row lg:items-center lg:justify-between">
        <div className="relative w-full lg:max-w-sm">
          <Search size={16} className="pointer-events-none absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground" />
          <Input
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Tìm theo biển số, hãng xe hoặc dòng xe..."
            className="h-9 pl-9"
          />
        </div>
        <select value={sort} onChange={(e) => setSort(e.target.value)} className={selectClass} aria-label="Sắp xếp">
          <option value="newest">Mới nhất</option>
          <option value="oldest">Cũ nhất</option>
          <option value="lastCare">Chăm sóc gần nhất</option>
          <option value="mostBookings">Nhiều lịch nhất</option>
        </select>
      </div>

      {/* Tabs */}
      <div className="-mx-1 flex gap-1.5 overflow-x-auto px-1 pb-1">
        {TABS.map((t) => {
          const active = t.key === tab;
          return (
            <button
              key={t.key}
              type="button"
              onClick={() => setTab(t.key)}
              className={`inline-flex shrink-0 items-center gap-1.5 rounded-xl px-3.5 py-2 text-sm font-bold transition ${
                active ? "bg-primary text-primary-foreground shadow-sm" : "border border-border bg-card text-muted-foreground hover:bg-surface"
              }`}
            >
              {t.label}
              <span className={`rounded-full px-1.5 text-xs ${active ? "bg-white/25" : "bg-muted"}`}>
                {tabCounts[t.key] ?? 0}
              </span>
            </button>
          );
        })}
      </div>

      {/* Content */}
      {loading ? (
        <div className="grid gap-6 lg:grid-cols-2">
          {Array.from({ length: 4 }).map((_, i) => (
            <Skeleton key={i} className="h-56 rounded-2xl" />
          ))}
        </div>
      ) : error ? (
        <div className="rounded-2xl border border-critical/25 bg-critical-container p-10 text-center">
          <span className="mx-auto grid size-12 place-items-center rounded-full bg-critical/10 text-critical">
            <AlertTriangle size={22} />
          </span>
          <h2 className="mt-3 text-lg font-extrabold text-critical">Không thể tải danh sách phương tiện</h2>
          <p className="mt-1 text-sm text-critical/90">Vui lòng thử lại sau.</p>
          <Button onClick={load} className="mt-4 bg-critical text-white hover:bg-critical/90">Thử lại</Button>
        </div>
      ) : vehicles.length === 0 ? (
        <EmptyState
          icon={Car}
          title="Bạn chưa thêm xe nào"
          description="Thêm xe để đặt lịch rửa nhanh hơn."
          action={
            <Button size="lg" onClick={() => setForm({ open: true, mode: "add", vehicle: null })}>
              <Plus size={18} /> Thêm xe mới
            </Button>
          }
        />
      ) : filtered.length === 0 ? (
        <EmptyState
          icon={Search}
          title="Không tìm thấy phương tiện phù hợp"
          description="Thử kiểm tra lại biển số, hãng xe hoặc bộ lọc."
          action={
            <Button variant="outline" onClick={() => { setTab("all"); setSearch(""); }}>
              Xóa bộ lọc
            </Button>
          }
        />
      ) : (
        <>
          <div className="grid gap-4 lg:grid-cols-2">
            {pageItems.map((v) => (
              <VehicleCard
                key={v.id}
                vehicle={v}
                stats={stats[v.id]}
                onBook={handleBook}
                onDetail={setDetailVehicle}
                onEdit={(veh) => setForm({ open: true, mode: "edit", vehicle: veh })}
                onToggleStatus={handleToggleStatus}
                onDelete={handleDelete}
                onSetDefault={handleSetDefault}
              />
            ))}
          </div>
          {filtered.length > PAGE_SIZE && (
            <div className="rounded-2xl border border-border bg-card">
              <Pagination page={safePage} pageSize={PAGE_SIZE} total={filtered.length} onPageChange={setPage} />
            </div>
          )}
        </>
      )}

      <VehicleDetailDrawer
        vehicle={detailVehicle}
        stats={detailVehicle ? stats[detailVehicle.id] : null}
        onClose={() => setDetailVehicle(null)}
        onBook={(v) => { setDetailVehicle(null); handleBook(v); }}
        onEdit={(v) => { setDetailVehicle(null); setForm({ open: true, mode: "edit", vehicle: v }); }}
      />

      <VehicleFormDialog
        open={form.open}
        mode={form.mode}
        vehicle={form.vehicle}
        submitting={submitting}
        onClose={() => !submitting && setForm({ open: false, mode: "add", vehicle: null })}
        onSubmit={handleSubmitForm}
      />
    </PageContainer>
  );
}
