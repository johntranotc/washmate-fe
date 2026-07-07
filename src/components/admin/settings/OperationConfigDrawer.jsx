import { useCallback, useEffect, useState } from "react";
import { RefreshCw, AlertTriangle, Trash2, Clock } from "lucide-react";
import {
  AlertDialog,
  AlertDialogContent,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogCancel,
} from "@/components/ui/alert-dialog";
import { Button } from "@/components/ui/button";
import { toast } from "@/components/ui/toast";
import { confirmDialog } from "@/components/shared/ConfirmDialog";
import { garageApi } from "@/api/garageApi";
import { bookingSlotApi } from "@/api/bookingSlotApi";
import { todayISO, formatTime, formatNumber, friendlyName } from "@/lib/format";

const EMPTY_SLOT_FORM = { startTime: "", endTime: "", maxCapacity: "" };

/**
 * Drawer Cấu hình vận hành — khung giờ & công suất theo chi nhánh, API thật:
 *   GET    /v1/garages/{garageId}/slots?date=  (danh sách khung giờ theo ngày)
 *   POST   /v1/garages/{garageId}/slots        { startTime, endTime, maxCapacity }
 *   PUT    /v1/slots/{slotId}/capacity         { maxCapacity > 0 }
 *   DELETE /v1/slots/{slotId}
 * BE chưa có API giờ mở cửa / quy tắc nhận lịch → hiển thị "Sắp có".
 */
export function OperationConfigDrawer({ open, onOpenChange }) {
  const [garages, setGarages] = useState([]);
  const [garageId, setGarageId] = useState("");
  const [date, setDate] = useState(todayISO());
  const [slots, setSlots] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  const [capacityDraft, setCapacityDraft] = useState({}); // slotId -> value đang sửa
  const [busySlotId, setBusySlotId] = useState(null);
  const [slotForm, setSlotForm] = useState(EMPTY_SLOT_FORM);
  const [creating, setCreating] = useState(false);

  // Danh sách chi nhánh thật để chọn phạm vi áp dụng.
  useEffect(() => {
    if (!open) return;
    garageApi.getAll()
      .then((d) => {
        const list = (Array.isArray(d) ? d : d?.data || []).filter((g) => g.status !== "DELETED");
        setGarages(list);
        setGarageId((prev) => prev || String(list[0]?.id ?? list[0]?.garageId ?? ""));
      })
      .catch(() => setGarages([]));
  }, [open]);

  const loadSlots = useCallback(() => {
    if (!garageId || !date) return;
    setLoading(true);
    setError(null);
    bookingSlotApi.getByGarage(garageId, { date })
      .then((d) => {
        const list = Array.isArray(d) ? d : d?.data || [];
        setSlots([...list].sort((a, b) => String(a.startTime).localeCompare(String(b.startTime))));
      })
      .catch((e) => {
        setError(e?.message || "Không thể tải khung giờ. Vui lòng thử lại.");
        setSlots([]);
      })
      .finally(() => setLoading(false));
  }, [garageId, date]);

  useEffect(() => {
    if (!open) return;
    setCapacityDraft({});
    loadSlots();
  }, [open, loadSlots]);

  async function handleSaveCapacity(slot) {
    const raw = capacityDraft[slot.slotId];
    const next = Number(raw);
    if (!Number.isInteger(next) || next <= 0) {
      toast.error("Công suất không hợp lệ", { description: "Nhập số nguyên lớn hơn 0." });
      return;
    }
    if (next === slot.maxCapacity) return;
    const ok = await confirmDialog({
      title: "Cập nhật công suất khung giờ?",
      description: `Khung ${formatTime(slot.startTime)}–${formatTime(slot.endTime)}: ${slot.maxCapacity} → ${next} xe. Số lịch nhận tối đa của khung giờ sẽ thay đổi ngay.`,
      confirmLabel: "Cập nhật",
    });
    if (!ok) return;
    setBusySlotId(slot.slotId);
    try {
      await bookingSlotApi.update(slot.slotId, { maxCapacity: next });
      toast.success("Đã cập nhật công suất", {
        description: `Khung ${formatTime(slot.startTime)}–${formatTime(slot.endTime)}: tối đa ${next} xe.`,
      });
      setCapacityDraft((prev) => { const { [slot.slotId]: _drop, ...rest } = prev; return rest; });
      loadSlots();
    } catch (e) {
      toast.error("Cập nhật thất bại", { description: e?.message || "Lỗi không xác định" });
    } finally {
      setBusySlotId(null);
    }
  }

  async function handleDeleteSlot(slot) {
    const booked = Number(slot.bookedCapacity || 0);
    const ok = await confirmDialog({
      title: "Xóa khung giờ này?",
      description: `Khung ${formatTime(slot.startTime)}–${formatTime(slot.endTime)}${
        booked > 0 ? ` đang có ${booked} lịch đã đặt` : ""
      }. Khách sẽ không thể đặt lịch vào khung giờ này nữa.`,
      confirmLabel: "Xóa khung giờ",
      destructive: true,
    });
    if (!ok) return;
    setBusySlotId(slot.slotId);
    try {
      await bookingSlotApi.delete(slot.slotId);
      toast.success("Đã xóa khung giờ", {
        description: `${formatTime(slot.startTime)}–${formatTime(slot.endTime)}`,
      });
      loadSlots();
    } catch (e) {
      toast.error("Xóa thất bại", { description: e?.message || "Lỗi không xác định" });
    } finally {
      setBusySlotId(null);
    }
  }

  async function handleCreateSlot(e) {
    e.preventDefault();
    const cap = Number(slotForm.maxCapacity);
    if (!slotForm.startTime || !slotForm.endTime) {
      toast.error("Thiếu thông tin", { description: "Chọn giờ bắt đầu và giờ kết thúc." });
      return;
    }
    if (slotForm.endTime <= slotForm.startTime) {
      toast.error("Khung giờ không hợp lệ", { description: "Giờ kết thúc phải sau giờ bắt đầu." });
      return;
    }
    if (!Number.isInteger(cap) || cap <= 0) {
      toast.error("Công suất không hợp lệ", { description: "Nhập số nguyên lớn hơn 0." });
      return;
    }
    setCreating(true);
    try {
      await bookingSlotApi.create(garageId, {
        startTime: slotForm.startTime,
        endTime: slotForm.endTime,
        maxCapacity: cap,
      });
      toast.success("Đã thêm khung giờ", {
        description: `${slotForm.startTime}–${slotForm.endTime} · tối đa ${cap} xe`,
      });
      setSlotForm(EMPTY_SLOT_FORM);
      loadSlots();
    } catch (e2) {
      toast.error("Thêm khung giờ thất bại", { description: e2?.message || "Lỗi không xác định" });
    } finally {
      setCreating(false);
    }
  }

  const inputCls =
    "h-10 rounded-xl border border-input bg-background px-2.5 text-xs font-bold outline-none focus:border-ring";

  return (
    <AlertDialog open={open} onOpenChange={onOpenChange}>
      <AlertDialogContent className="max-h-[85vh] w-[min(36rem,calc(100vw-2rem))] overflow-y-auto">
        <AlertDialogHeader>
          <AlertDialogTitle>Cấu hình vận hành</AlertDialogTitle>
          <AlertDialogDescription>
            Quản lý khung giờ nhận lịch và công suất phục vụ theo chi nhánh.
          </AlertDialogDescription>
        </AlertDialogHeader>

        {/* Phạm vi áp dụng */}
        <div className="mt-4 flex flex-wrap items-center gap-2">
          <select
            value={garageId}
            onChange={(e) => setGarageId(e.target.value)}
            className={`${inputCls} min-w-0 flex-1`}
            aria-label="Chi nhánh áp dụng"
          >
            {garages.length === 0 && <option value="">Chưa có chi nhánh</option>}
            {garages.map((g) => (
              <option key={g.id ?? g.garageId} value={g.id ?? g.garageId}>
                {friendlyName(g.name ?? g.garageName, "Chi nhánh chưa cập nhật")}
              </option>
            ))}
          </select>
          <input
            type="date"
            value={date}
            onChange={(e) => setDate(e.target.value)}
            className={inputCls}
            aria-label="Ngày áp dụng"
          />
          <Button variant="outline" size="sm" onClick={loadSlots} disabled={loading || !garageId}>
            <RefreshCw className={loading ? "animate-spin" : ""} /> Tải lại
          </Button>
        </div>

        {/* Danh sách khung giờ */}
        <div className="mt-3 rounded-xl border border-border p-4">
          <p className="text-xs font-bold text-foreground">Khung giờ trong ngày ({slots.length})</p>

          {loading ? (
            <p className="py-8 text-center text-xs text-muted-foreground">
              <RefreshCw className="mx-auto mb-2 animate-spin" size={18} />
              Đang tải khung giờ...
            </p>
          ) : error ? (
            <div className="py-6 text-center">
              <AlertTriangle className="mx-auto mb-2 text-critical" size={20} />
              <p className="text-xs font-bold text-critical">{error}</p>
              <Button size="sm" variant="outline" className="mt-3" onClick={loadSlots}>Thử lại</Button>
            </div>
          ) : slots.length === 0 ? (
            <div className="py-8 text-center">
              <Clock size={28} className="mx-auto text-border" />
              <p className="mt-2 text-xs font-semibold text-foreground">Chưa có khung giờ nào cho ngày này.</p>
              <p className="mt-0.5 text-xs text-neutral-muted">Thêm khung giờ mới ở bên dưới để nhận lịch.</p>
            </div>
          ) : (
            <div className="mt-2 space-y-2">
              {slots.map((s) => {
                const busy = busySlotId === s.slotId;
                const draft = capacityDraft[s.slotId] ?? String(s.maxCapacity ?? "");
                const changed = Number(draft) !== s.maxCapacity;
                return (
                  <div
                    key={s.slotId}
                    className="grid grid-cols-[minmax(0,1fr)_auto] items-center gap-2 rounded-xl border border-border bg-surface px-3 py-2"
                  >
                    <div className="min-w-0">
                      <b className="text-sm text-foreground">
                        {formatTime(s.startTime)} – {formatTime(s.endTime)}
                      </b>
                      <p className="mt-0.5 text-xs text-muted-foreground">
                        Đã đặt {formatNumber(s.bookedCapacity || 0)} / {formatNumber(s.maxCapacity || 0)} xe
                        {Number(s.availableCapacity) === 0 && (
                          <span className="ml-1.5 rounded-full bg-warning-container px-1.5 py-0.5 text-xs font-bold text-warning">
                            Đã đầy
                          </span>
                        )}
                      </p>
                    </div>
                    <div className="flex items-center gap-1.5">
                      <input
                        type="number"
                        min={1}
                        value={draft}
                        onChange={(e) => setCapacityDraft({ ...capacityDraft, [s.slotId]: e.target.value })}
                        className="h-9 w-16 rounded-lg border border-input bg-background px-2 text-center text-xs font-bold outline-none focus:border-ring"
                        aria-label="Công suất tối đa"
                        disabled={busy}
                      />
                      <Button size="sm" variant="outline" disabled={busy || !changed} onClick={() => handleSaveCapacity(s)}>
                        Lưu
                      </Button>
                      <button
                        type="button"
                        aria-label="Xóa khung giờ"
                        disabled={busy}
                        onClick={() => handleDeleteSlot(s)}
                        className="grid h-9 w-9 place-items-center rounded-lg border border-border text-critical hover:bg-critical-container disabled:opacity-40"
                      >
                        <Trash2 size={15} />
                      </button>
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </div>

        {/* Thêm khung giờ mới */}
        <form onSubmit={handleCreateSlot} className="mt-3 rounded-xl border border-border p-4">
          <p className="text-xs font-bold text-foreground">Thêm khung giờ mới</p>
          <div className="mt-2 flex flex-wrap items-end gap-2">
            <label className="text-xs font-semibold text-muted-foreground">
              Bắt đầu
              <input
                type="time"
                value={slotForm.startTime}
                onChange={(e) => setSlotForm({ ...slotForm, startTime: e.target.value })}
                className={`${inputCls} mt-1 block`}
              />
            </label>
            <label className="text-xs font-semibold text-muted-foreground">
              Kết thúc
              <input
                type="time"
                value={slotForm.endTime}
                onChange={(e) => setSlotForm({ ...slotForm, endTime: e.target.value })}
                className={`${inputCls} mt-1 block`}
              />
            </label>
            <label className="text-xs font-semibold text-muted-foreground">
              Tối đa (xe)
              <input
                type="number"
                min={1}
                value={slotForm.maxCapacity}
                onChange={(e) => setSlotForm({ ...slotForm, maxCapacity: e.target.value })}
                className={`${inputCls} mt-1 block w-24`}
                placeholder="VD: 5"
              />
            </label>
            <Button type="submit" size="sm" disabled={creating || !garageId}>
              {creating ? "Đang thêm..." : "Thêm khung giờ"}
            </Button>
          </div>
        </form>

        {/* Chưa có API giờ mở cửa / quy tắc nhận lịch */}
        <div className="mt-3 rounded-xl border border-dashed border-border p-4">
          <div className="flex items-center justify-between gap-2">
            <p className="text-xs font-bold text-foreground">Giờ mở cửa & quy tắc nhận lịch</p>
            <span className="rounded-full bg-warning-container px-2 py-0.5 text-xs font-bold text-warning">Sắp có</span>
          </div>
          <p className="mt-1 text-xs text-neutral-muted">
            Sẽ được kích hoạt khi hệ thống hỗ trợ cấu hình tương ứng.
          </p>
        </div>

        <AlertDialogFooter>
          <AlertDialogCancel>Đóng</AlertDialogCancel>
        </AlertDialogFooter>
      </AlertDialogContent>
    </AlertDialog>
  );
}
