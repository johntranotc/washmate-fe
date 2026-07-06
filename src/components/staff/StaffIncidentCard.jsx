import { Button } from "@/components/ui/button";
import { STAFF_ASSETS } from "@/lib/staff-assets";

/**
 * "Báo sự cố" — BE chưa có incident API nên card ở trạng thái disabled rõ ràng,
 * không fake submit. Khi BE bổ sung endpoint, nối form thật tại đây.
 */
export function StaffIncidentCard() {
  return (
    <section className="rounded-2xl border border-border bg-card p-5">
      <div className="flex items-center gap-3">
        <img src={STAFF_ASSETS.illustration.incidentAlert} alt="" className="h-14 w-14 shrink-0" />
        <div className="min-w-0">
          <h2 className="text-lg font-bold text-foreground">Báo sự cố</h2>
          <p className="mt-0.5 text-xs text-muted-foreground">
            Ghi nhận hư hỏng, trễ tiến độ hoặc vấn đề với xe của khách.
          </p>
        </div>
      </div>
      {/* BE chưa có incident API — disabled rõ ràng, không fake submit */}
      <Button variant="outline" className="mt-4 w-full" disabled title="Tính năng đang được hoàn thiện">
        <img src={STAFF_ASSETS.action.incident} alt="" width={16} height={16} className="rounded" />
        Gửi báo cáo sự cố
      </Button>
      <p className="mt-2 text-center text-xs text-neutral-muted">Tính năng đang được hoàn thiện.</p>
    </section>
  );
}
