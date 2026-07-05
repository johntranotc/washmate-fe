import { NO_SHOW_GRACE_MINUTES } from "@/lib/staff-booking-data";
import { STAFF_ASSETS } from "@/lib/staff-assets";

// BE chưa có policy/config API — đây là rule text tĩnh ngắn được phép dùng,
// riêng grace period lấy từ hằng số dùng chung với logic No-show.
const RULES = [
  `Giữ chỗ tối đa ${NO_SHOW_GRACE_MINUTES} phút sau giờ hẹn.`,
  "Quá thời gian giữ chỗ sẽ chuyển No-show.",
  "Chỉ check-in khi khách đã thanh toán.",
  "Cập nhật tiến độ kịp thời để khách theo dõi.",
];

/** "Quy tắc vận hành" — checklist ngắn cho staff trong ca. */
export function StaffRulesCard() {
  return (
    <section className="rounded-2xl border border-border bg-card p-5">
      <div className="flex items-center gap-2">
        <img src={STAFF_ASSETS.action.info} alt="" width={20} height={20} className="rounded" />
        <h2 className="text-lg font-bold text-foreground">Quy tắc vận hành</h2>
      </div>
      <ul className="mt-3 space-y-2">
        {RULES.map((rule) => (
          <li key={rule} className="flex items-start gap-2 text-xs text-muted-foreground">
            <span className="mt-1.5 inline-block h-1.5 w-1.5 shrink-0 rounded-full bg-primary" />
            {rule}
          </li>
        ))}
      </ul>
    </section>
  );
}
