import { SectionHeading } from "@/components/site/section-heading";
import { LinkButton } from "@/components/site/link-button";
import { TierBadge } from "@/components/customer-portal/tier-badge";

// Bậc hạng thành viên (giới thiệu chương trình). Mốc điểm & mức giảm cụ thể do
// từng chi nhánh cấu hình, hiển thị khi khách đăng nhập — ở đây chỉ giới thiệu bậc.
const TIERS = [
  { name: "Đồng", desc: "Hạng khởi đầu cho mọi khách hàng mới." },
  { name: "Bạc", desc: "Tích điểm mỗi lần rửa, bắt đầu nhận ưu đãi." },
  { name: "Vàng", desc: "Giảm giá hấp dẫn cho khách thường xuyên." },
  { name: "Bạch Kim", desc: "Đặc quyền cao cấp dành cho khách thân thiết." },
  { name: "Kim Cương", desc: "Ưu đãi lớn nhất, hạng cao nhất của WashMate." },
];

export function MembershipTiers() {
  return (
    <section
      id="hang-thanh-vien"
      className="relative overflow-hidden bg-[linear-gradient(160deg,var(--primary-container),var(--surface-tint))] py-16 lg:py-20"
    >
      {/* Vầng sáng xanh nhạt tạo điểm nhấn, không che nội dung */}
      <div
        aria-hidden="true"
        className="pointer-events-none absolute -top-24 left-1/2 h-72 w-[46rem] -translate-x-1/2 rounded-full bg-primary/15 blur-3xl"
      />
      <div className="relative mx-auto max-w-6xl px-4 sm:px-6 lg:px-8">
        <SectionHeading
          eyebrow="Hạng thành viên"
          title="Rửa xe càng nhiều, ưu đãi càng lớn"
          description="Mỗi lần rửa xe hoàn tất, bạn được tích điểm và lên hạng. Hạng càng cao, mức giảm giá mỗi lần rửa càng nhiều."
        />

        <div className="mt-12 grid gap-5 sm:grid-cols-2 lg:grid-cols-5">
          {TIERS.map((tier, i) => (
            <article
              key={tier.name}
              className="flex flex-col items-center rounded-2xl border border-border bg-card p-6 text-center shadow-card transition hover:-translate-y-1 hover:border-primary/40"
            >
              <TierBadge name={tier.name} index={i} size="size-20" iconSize={38} className="shadow-card" />
              <h3 className="mt-4 text-lg font-extrabold text-foreground">{tier.name}</h3>
              <p className="mt-2 text-sm leading-relaxed text-muted-foreground">{tier.desc}</p>
            </article>
          ))}
        </div>

        <p className="mt-8 text-center text-sm text-muted-foreground">
          * Mốc điểm và mức giảm của từng hạng do mỗi chi nhánh cấu hình, hiển thị khi bạn đăng nhập.
        </p>

        <div className="mt-6 text-center">
          <LinkButton href="/register" size="lg">
            Đăng ký tích điểm ngay
          </LinkButton>
        </div>
      </div>
    </section>
  );
}
