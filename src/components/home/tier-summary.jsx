import { ArrowRight } from "lucide-react";
import { Link } from "react-router-dom";
import { TierBadge } from "@/components/site/tier-badge";
import { SectionHeading } from "@/components/site/section-heading";
import { tiers } from "@/lib/site-data";

export function TierSummary() {
  return (
    <section className="bg-background py-20 lg:py-28">
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        <SectionHeading eyebrow="Hạng thành viên" title="Càng gắn bó, càng nhiều đặc quyền" description="Năm hạng thành viên đồng bộ, tự động nâng hạng theo điểm tích lũy." />
        <div className="mt-14 grid grid-cols-2 gap-4 sm:grid-cols-3 lg:grid-cols-5">
          {tiers.map((tier) => (
            <div key={tier.name} className="flex flex-col items-center rounded-3xl border border-border bg-card p-5 text-center shadow-sm">
              <TierBadge tier={tier} size="sm" />
              <strong className="mt-4 text-lg" style={{ color: tier.color }}>{tier.name}</strong>
              <span className="mt-1 text-sm text-muted-foreground">{tier.discount}</span>
            </div>
          ))}
        </div>
        <div className="mt-10 text-center">
          <Link to="/hang-thanh-vien" className="inline-flex items-center gap-2 font-bold text-primary hover:underline">Khám phá quyền lợi <ArrowRight className="size-4" /></Link>
        </div>
      </div>
    </section>
  );
}
