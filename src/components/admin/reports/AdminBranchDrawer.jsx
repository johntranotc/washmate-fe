import {
  AlertDialog,
  AlertDialogContent,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogCancel,
} from "@/components/ui/alert-dialog";
import { formatMoney, formatNumber, friendlyName } from "@/lib/format";

/**
 * Drawer chi tiết hiệu suất chi nhánh — toàn bộ tính từ booking thật trong kỳ
 * đã chọn (đã tổng hợp sẵn ở trang Báo cáo).
 * branch: { name, total, completed, cancelledNoShow, revenue,
 *   payments: { paid, pending, failed, refunded }, topServices: [{name,count,revenue}] }
 */
export function AdminBranchDrawer({ branch, open, onOpenChange }) {
  if (!branch) return null;

  const completionRate = branch.total > 0 ? Math.round((branch.completed / branch.total) * 100) : 0;
  const rows = [
    ["Tổng lịch trong kỳ", formatNumber(branch.total)],
    ["Hoàn thành", `${formatNumber(branch.completed)} (${completionRate}%)`],
    ["Hủy / No-show", formatNumber(branch.cancelledNoShow)],
    ["Doanh thu trong kỳ", formatMoney(branch.revenue)],
  ];
  const paymentRows = [
    ["Đã thanh toán", branch.payments.paid, "text-success"],
    ["Chờ thanh toán", branch.payments.pending, "text-warning"],
    ["Thất bại / cần đối soát", branch.payments.failed, "text-critical"],
    ["Đã hoàn tiền", branch.payments.refunded, "text-primary-strong"],
  ];

  return (
    <AlertDialog open={open} onOpenChange={onOpenChange}>
      <AlertDialogContent className="max-h-[85vh] overflow-y-auto">
        <AlertDialogHeader>
          <AlertDialogTitle>{friendlyName(branch.name, "Chi nhánh chưa cập nhật")}</AlertDialogTitle>
          <AlertDialogDescription>Hiệu suất chi nhánh trong kỳ đã chọn</AlertDialogDescription>
        </AlertDialogHeader>

        <dl className="mt-4 space-y-2 rounded-xl border border-border bg-surface p-4">
          {rows.map(([label, value]) => (
            <div key={label} className="flex items-baseline justify-between gap-4 text-sm">
              <dt className="shrink-0 text-muted-foreground">{label}</dt>
              <dd className="text-right font-semibold text-foreground">{value}</dd>
            </div>
          ))}
        </dl>

        <div className="mt-3 rounded-xl border border-border p-4">
          <p className="text-xs font-bold text-foreground">Tình trạng thanh toán</p>
          <div className="mt-2 grid grid-cols-2 gap-2">
            {paymentRows.map(([label, value, cls]) => (
              <div key={label} className="text-xs">
                <b className={`text-sm font-semibold ${cls}`}>{formatNumber(value)}</b>
                <p className="mt-0.5 leading-4 text-muted-foreground">{label}</p>
              </div>
            ))}
          </div>
        </div>

        <div className="mt-3 rounded-xl border border-border p-4">
          <p className="text-xs font-bold text-foreground">Top dịch vụ trong kỳ</p>
          {branch.topServices.length === 0 ? (
            <p className="mt-1 text-xs text-neutral-muted">Chưa có dịch vụ hoàn thành trong kỳ.</p>
          ) : (
            <div className="mt-2 space-y-1.5">
              {branch.topServices.map((s) => (
                <div key={s.name} className="flex items-center justify-between gap-3 text-xs">
                  <span className="truncate font-semibold text-ink-soft">{s.name}</span>
                  <span className="shrink-0 text-muted-foreground">
                    {formatNumber(s.count)} lịch · <b className="text-foreground">{formatMoney(s.revenue)}</b>
                  </span>
                </div>
              ))}
            </div>
          )}
        </div>

        <AlertDialogFooter>
          <AlertDialogCancel>Đóng</AlertDialogCancel>
        </AlertDialogFooter>
      </AlertDialogContent>
    </AlertDialog>
  );
}
