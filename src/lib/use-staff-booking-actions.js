import { useCallback, useState } from "react";
import { staffApi } from "@/api/staffApi";
import { paymentApi } from "@/api/paymentApi";
import { toast } from "@/components/ui/toast";
import { confirmDialog } from "@/components/shared/ConfirmDialog";

// Nội dung confirm dialog cho từng bước workflow (action quan trọng đều phải confirm).
const CONFIRM_COPY = {
  confirmBooking: (b) => ({
    title: "Xác nhận lịch đặt?",
    description: `Nhận lịch ${b.code} của khách ${b.customerName} (${b.plate}).`,
    confirmLabel: "Xác nhận lịch",
  }),
  startWashing: (b) => ({
    title: "Bắt đầu rửa xe?",
    description: `Xe ${b.plate} (${b.code}) sẽ chuyển sang trạng thái "Đang rửa xe".`,
    confirmLabel: "Bắt đầu rửa",
  }),
  completeBooking: (b) => ({
    title: "Hoàn tất dịch vụ?",
    description: `Xác nhận xe ${b.plate} (${b.code}) đã rửa xong và bàn giao cho khách.`,
    confirmLabel: "Hoàn tất dịch vụ",
  }),
};

/**
 * Hook dùng chung cho Tổng quan + Hàng đợi: mọi thao tác booking gọi API thật,
 * confirm trước khi gọi, toast kết quả, và refetch qua `reload` sau khi thành công.
 */
export function useStaffBookingActions(reload) {
  const [busyId, setBusyId] = useState(null);

  const run = useCallback(async (booking, fn, successTitle) => {
    if (busyId) return;
    setBusyId(booking.id);
    try {
      await fn();
      toast.success(successTitle, { description: `${booking.code} · ${booking.plate}` });
      // PHẢI await: nếu chỉ bắn reload rồi nhả nút ngay, thao tác kế tiếp có thể
      // khiến response reload cũ (chưa có thay đổi) về sau, ghi đè danh sách mới
      // → trạng thái "nhảy" về như chưa bấm dù đã thành công.
      await reload?.();
    } catch (e) {
      console.error("Staff action failed:", e);
      toast.error("Thao tác thất bại", { description: e?.message || "Lỗi không xác định" });
    } finally {
      setBusyId(null);
    }
  }, [busyId, reload]);

  /** Chạy bước workflow kế tiếp (kết quả của getNextStaffAction, trừ check-in có modal riêng). */
  const handleNextAction = useCallback(async (booking, action) => {
    if (!action?.enabled) return;
    const copy = CONFIRM_COPY[action.api]?.(booking);
    if (copy && !(await confirmDialog(copy))) return;
    await run(booking, () => staffApi[action.api](booking.id), `${action.label} thành công`);
  }, [run]);

  /** Staff thu tiền trực tiếp — POST /payments/{id}/confirm. */
  const handleConfirmPayment = useCallback(async (booking) => {
    if (!booking.paymentId) return;
    const ok = await confirmDialog({
      title: "Xác nhận đã thanh toán?",
      description: `Xác nhận khách ${booking.customerName} đã thanh toán cho booking ${booking.code} (thu trực tiếp).`,
      confirmLabel: "Đã thanh toán",
    });
    if (!ok) return;
    await run(booking, () => paymentApi.confirmPayment(booking.paymentId, {}), "Đã ghi nhận thanh toán");
  }, [run]);

  /** Chuyển No-show — BE chỉ cho phép từ CONFIRMED, FE đã chặn thêm theo grace period. */
  const handleNoShow = useCallback(async (booking) => {
    const ok = await confirmDialog({
      title: "Chuyển No-show?",
      description: `Khách ${booking.customerName} (${booking.code}) đã quá thời gian giữ chỗ. Booking sẽ chuyển sang "Không đến".`,
      confirmLabel: "Chuyển No-show",
      destructive: true,
    });
    if (!ok) return;
    await run(booking, () => staffApi.markNoShow(booking.id), "Đã chuyển No-show");
  }, [run]);

  return { busyId, handleNextAction, handleConfirmPayment, handleNoShow };
}
