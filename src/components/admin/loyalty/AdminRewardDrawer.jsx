import {
  AlertDialog,
  AlertDialogContent,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogCancel,
} from "@/components/ui/alert-dialog";
import { formatNumber, friendlyName } from "@/lib/format";

export const REWARD_STATUS_LABELS = {
  ACTIVE: "Đang hoạt động",
  INACTIVE: "Tạm ẩn",
  OUT_OF_STOCK: "Hết quà",
};

export const REWARD_STATUS_TONES = {
  ACTIVE: "bg-success-container text-success",
  INACTIVE: "bg-muted text-muted-foreground",
  OUT_OF_STOCK: "bg-warning-container text-warning",
};

/**
 * Drawer chi tiết ưu đãi đổi điểm — dữ liệu thật từ GET /v1/rewards.
 * BE chưa có hạn sử dụng, số lượt đã đổi, lịch sử chỉnh sửa → empty state.
 * reward: đã enrich { ..., garageName }
 */
export function AdminRewardDrawer({ reward, open, onOpenChange }) {
  if (!reward) return null;

  const rows = [
    ["Điểm cần đổi", `${formatNumber(reward.pointsRequired || 0)} điểm`],
    ["Số lượng còn lại", formatNumber(reward.stock || 0)],
    ["Gara áp dụng", friendlyName(reward.garageName, "Gara chưa cập nhật")],
    ["Trạng thái", REWARD_STATUS_LABELS[reward.status] || reward.status || "—"],
    ["Hạn sử dụng", "Không giới hạn"],
  ];

  return (
    <AlertDialog open={open} onOpenChange={onOpenChange}>
      <AlertDialogContent className="max-h-[85vh] overflow-y-auto">
        <AlertDialogHeader>
          <AlertDialogTitle>{friendlyName(reward.name, "Ưu đãi chưa cập nhật")}</AlertDialogTitle>
          <AlertDialogDescription>Chi tiết ưu đãi đổi điểm</AlertDialogDescription>
        </AlertDialogHeader>

        <dl className="mt-4 space-y-2 rounded-xl border border-border bg-surface p-4">
          {rows.map(([label, value]) => (
            <div key={label} className="flex items-baseline justify-between gap-4 text-sm">
              <dt className="shrink-0 text-muted-foreground">{label}</dt>
              <dd className="text-right font-bold text-foreground">{value}</dd>
            </div>
          ))}
        </dl>

        <div className="mt-3 rounded-xl border border-border p-4">
          <p className="text-xs font-bold text-foreground">Mô tả & điều kiện áp dụng</p>
          <p className="mt-1 text-sm leading-6 text-muted-foreground">
            {friendlyName(reward.description, "Mô tả chưa cập nhật")}
          </p>
        </div>

        {/* BE chưa có API thống kê lượt đổi / lịch sử chỉnh sửa */}
        <div className="mt-3 rounded-xl border border-dashed border-border p-4">
          <p className="text-xs font-bold text-foreground">Số lượt đã đổi</p>
          <p className="mt-1 text-xs text-neutral-muted">Chưa có dữ liệu từ hệ thống.</p>
        </div>
        <div className="mt-3 rounded-xl border border-dashed border-border p-4">
          <p className="text-xs font-bold text-foreground">Lịch sử chỉnh sửa</p>
          <p className="mt-1 text-xs text-neutral-muted">Chưa có lịch sử chỉnh sửa.</p>
        </div>

        <AlertDialogFooter>
          <AlertDialogCancel>Đóng</AlertDialogCancel>
        </AlertDialogFooter>
      </AlertDialogContent>
    </AlertDialog>
  );
}
