import { useState } from "react";
import {
  AlertDialog,
  AlertDialogContent,
  AlertDialogHeader,
  AlertDialogFooter,
  AlertDialogTitle,
  AlertDialogDescription,
  AlertDialogCancel,
} from "@/components/ui/alert-dialog";
import { Button } from "@/components/ui/button";
import { staffApi } from "@/api/staffApi";
import { toast } from "@/components/ui/toast";

/**
 * Modal "Từ chối lịch đặt" — BE yêu cầu lý do (POST /bookings/{id}/reject, body { reason }).
 * Bắt nhập lý do trước khi cho gửi; thành công thì toast + onDone để refetch.
 */
export function StaffRejectModal({ booking, open, onOpenChange, onDone }) {
  const [reason, setReason] = useState("");
  const [submitting, setSubmitting] = useState(false);

  if (!booking) return null;

  async function handleReject() {
    if (!reason.trim() || submitting) return;
    setSubmitting(true);
    try {
      await staffApi.rejectBooking(booking.id, { reason: reason.trim() });
      toast.success("Đã từ chối lịch đặt", { description: `${booking.code} · ${booking.customerName}` });
      setReason("");
      onOpenChange(false);
      onDone?.();
    } catch (e) {
      toast.error("Từ chối thất bại", { description: e?.message || "Lỗi không xác định" });
    } finally {
      setSubmitting(false);
    }
  }

  return (
    <AlertDialog open={open} onOpenChange={(next) => { if (!submitting) onOpenChange(next); }}>
      <AlertDialogContent>
        <AlertDialogHeader>
          <AlertDialogTitle>Từ chối lịch đặt?</AlertDialogTitle>
          <AlertDialogDescription>
            {booking.code} · {booking.customerName} · {booking.plate}. Lý do sẽ được gửi tới khách.
          </AlertDialogDescription>
        </AlertDialogHeader>

        <label className="mt-4 block">
          <span className="text-xs font-bold text-foreground">Lý do từ chối (bắt buộc)</span>
          <textarea
            value={reason}
            onChange={(e) => setReason(e.target.value)}
            rows={3}
            placeholder="Ví dụ: Khung giờ đã đầy, gara bảo trì..."
            className="mt-1.5 w-full resize-none rounded-xl border border-input bg-background p-3 text-sm outline-none focus:border-ring"
          />
        </label>

        <AlertDialogFooter>
          <AlertDialogCancel disabled={submitting}>Hủy</AlertDialogCancel>
          <Button
            size="lg"
            variant="destructive"
            disabled={!reason.trim() || submitting}
            onClick={handleReject}
          >
            {submitting ? "Đang gửi..." : "Từ chối lịch"}
          </Button>
        </AlertDialogFooter>
      </AlertDialogContent>
    </AlertDialog>
  );
}
