import { History } from "lucide-react";

/**
 * "Hoạt động gần đây" — BE chưa có audit/activity API nên hiển thị empty state
 * trung thực, không fake log. Khi BE bổ sung endpoint, nối danh sách thật tại đây.
 */
export function RecentActivityCard() {
  return (
    <section className="rounded-2xl border border-border bg-card p-5">
      <h2 className="text-lg font-bold text-foreground">Hoạt động gần đây</h2>
      <div className="flex flex-col items-center py-8 text-center">
        <span className="grid h-12 w-12 place-items-center rounded-full bg-primary-container text-primary">
          <History size={20} />
        </span>
        <p className="mt-3 text-sm font-semibold text-foreground">Chưa có hoạt động gần đây.</p>
        <p className="mt-1 text-xs text-muted-foreground">
          Nhật ký thao tác sẽ hiển thị khi hệ thống được cập nhật.
        </p>
      </div>
    </section>
  );
}
