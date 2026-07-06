import { ArrowRight, Gem, Sparkles } from "lucide-react";
import { Link } from "react-router-dom";
import { tiers } from "@/lib/site-data";
import { cn } from "@/lib/utils";

export function TierSummary() {
  return (
    <section className="relative overflow-hidden bg-navy-deep py-16 lg:py-20">
      {/* Glow trang trí */}
      <div
        aria-hidden="true"
        className="pointer-events-none absolute inset-0 bg-[radial-gradient(ellipse_at_50%_-20%,rgba(37,99,235,0.35),transparent_60%)]"
      />
      <div className="relative mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        <div className="mx-auto flex max-w-3xl flex-col items-center gap-4 text-center">
          <span className="inline-flex items-center gap-2 rounded-full border border-white/15 bg-card/10 px-3.5 py-1.5 text-sm font-semibold text-primary-bright">
            <Gem className="size-4" />
            Hạng thành viên
          </span>
          <h2 className="text-pretty text-3xl font-extrabold tracking-tight text-white sm:text-4xl lg:text-5xl">
            Càng gắn bó, <span className="text-primary-bright">càng nhiều đặc quyền</span>
          </h2>
          <p className="text-pretty leading-relaxed text-primary-container/75">
            5 hạng thành viên được đồng bộ trên toàn hệ thống WashMate. Tích điểm
            khi sử dụng dịch vụ và tự động nâng hạng khi đạt đủ điểm.
          </p>
        </div>

        <div className="mt-12 grid grid-cols-2 gap-4 sm:grid-cols-3 lg:grid-cols-5">
          {tiers.map((tier) => {
            const featured = tier.name === "Vàng";
            return (
              <article
                key={tier.name}
                className={cn(
                  "flex flex-col items-center rounded-2xl border p-5 text-center transition hover:-translate-y-1",
                  featured
                    ? "border-tier-gold bg-card/10 shadow-floating"
                    : "border-white/10 bg-card/5",
                )}
              >
                <img
                  src={tier.medal}
                  alt={`Huy hiệu hạng ${tier.name}`}
                  className="size-28 object-contain"
                />
                <strong className="mt-4 text-xl font-extrabold" style={{ color: tier.color }}>
                  {tier.name}
                </strong>
                <span className="mt-1 text-sm text-primary-container/70">{tier.condition}</span>
                <span
                  className={cn(
                    "mt-3.5 w-full rounded-xl border py-2 text-sm font-bold",
                    featured
                      ? "border-tier-gold/60 bg-tier-gold/10 text-tier-gold"
                      : "border-white/15 bg-card/5 text-white",
                  )}
                >
                  {tier.discount}
                </span>
                <span className="mt-3.5 flex items-center gap-1.5 text-xs font-medium text-primary-container/75">
                  <Sparkles className="size-3.5 shrink-0" />
                  {tier.perk}
                </span>
              </article>
            );
          })}
        </div>

        <div className="mt-9 flex flex-col items-center gap-4 text-center">
          <p className="text-xs text-primary-container/55">
            * Ưu đãi có thể thay đổi theo chương trình. Vui lòng kiểm tra chi tiết trong ứng dụng WashMate.
          </p>
          <Link
            to="/tiers"
            className="inline-flex items-center gap-2 font-bold text-primary-bright hover:underline"
          >
            Khám phá quyền lợi từng hạng
            <ArrowRight className="size-4" />
          </Link>
        </div>
      </div>
    </section>
  );
}
