import { BadgePercent, CalendarClock, Search, Tag } from "lucide-react";
import PageContainer from "@/components/shared/PageContainer";
import PageHeader from "@/components/shared/PageHeader";
import { useEffect, useMemo, useState } from "react";
import { promotionApi } from "@/api/promotionApi";
import { normalizePromotions } from "@/lib/customer-engagement-data";

const filters = [
  ["ALL", "Tất cả"],
  ["ACTIVE", "Đang áp dụng"],
  ["EXPIRING", "Sắp hết hạn"],
  ["MEMBER", "Dành cho thành viên"],
];

export default function PromotionsPage() {
  const [promotions, setPromotions] = useState([]);
  const [filter, setFilter] = useState("ALL");
  const [query, setQuery] = useState("");


  useEffect(() => {
    promotionApi.getPromotions()
      .then((response) => {
        setPromotions(normalizePromotions(response));
      })
      .catch((error) => {
        console.error("Failed to load promotions:", error);
      });
  }, []);

  const visiblePromotions = useMemo(() => promotions.filter((item) => {
    const matchesFilter = filter === "ALL" || item.status === filter || (filter === "MEMBER" && item.memberOnly);
    const text = `${item.title} ${item.code} ${item.description}`.toLowerCase();
    return matchesFilter && text.includes(query.trim().toLowerCase());
  }), [filter, promotions, query]);

  return (
    <PageContainer variant="customer">
      <PageHeader
        eyebrow="Ưu đãi WashMate"
        title="Khám phá ưu đãi phù hợp"
        description="Xem chương trình đang có. Ưu đãi chưa được tự động áp dụng vào booking."
      />

      <section className="flex flex-col gap-3 rounded-2xl border border-border bg-card p-4 lg:flex-row lg:items-center lg:justify-between">
        <div className="flex flex-wrap gap-2">
          {filters.map(([value, label]) => (
            <button key={value} onClick={() => setFilter(value)} className={`rounded-full px-4 py-2 text-xs font-bold ${filter === value ? "bg-primary text-white" : "bg-muted text-muted-foreground"}`}>{label}</button>
          ))}
        </div>
        <label className="relative min-w-64">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-neutral-muted" size={16} />
          <input value={query} onChange={(event) => setQuery(event.target.value)} placeholder="Tìm theo tên hoặc mã..." className="w-full rounded-xl border border-border py-2.5 pl-10 pr-3 text-sm outline-none focus:border-primary" />
        </label>
      </section>
      {visiblePromotions.length === 0 ? (
        <div className="rounded-2xl border border-dashed border-border bg-card py-16 text-center text-sm text-muted-foreground">Không có ưu đãi phù hợp bộ lọc.</div>
      ) : (
        <section className="grid gap-5 md:grid-cols-2 xl:grid-cols-3">
          {visiblePromotions.map((item) => (
            <article key={item.id} className="flex min-h-72 flex-col overflow-hidden rounded-2xl border border-border bg-card shadow-sm">
              <div className="bg-primary-strong p-5 text-white">
                <div className="flex items-center justify-between"><BadgePercent size={28} /><span className="rounded-full bg-card/20 px-3 py-1 text-xs font-bold">{item.memberOnly ? "THÀNH VIÊN" : "ƯU ĐÃI"}</span></div>
                <p className="mt-5 text-2xl font-black">{item.discountLabel}</p>
              </div>
              <div className="flex flex-1 flex-col p-5">
                <h2 className="font-extrabold text-foreground">{item.title}</h2>
                <p className="mt-2 text-xs leading-5 text-muted-foreground">{item.description}</p>
                <div className="mt-auto space-y-2 pt-5 text-xs text-muted-foreground">
                  <p className="flex items-center gap-2"><Tag size={14} /> Mã: <b className="text-foreground">{item.code || "Tự động"}</b></p>
                  <p className="flex items-center gap-2"><CalendarClock size={14} /> Hạn dùng: {item.expiresAt ? new Date(item.expiresAt).toLocaleDateString("vi-VN") : "Theo chương trình"}</p>
                </div>
              </div>
            </article>
          ))}
        </section>
      )}
    </PageContainer>
  );
}
