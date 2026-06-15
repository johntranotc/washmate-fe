import { BadgePercent, CalendarClock, Search, Tag } from "lucide-react";
import { useEffect, useMemo, useState } from "react";
import { promotionApi } from "../../api/promotionApi";
import DemoDataNotice from "../../components/customer/DemoDataNotice";
import { normalizePromotions } from "../../lib/customer-engagement-data";
import { promotionMockData } from "../../mocks/promotionMockData";

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
  const [isMock, setIsMock] = useState(false);

  useEffect(() => {
    promotionApi.getPromotions()
      .then((response) => {
        setPromotions(normalizePromotions(response));
        setIsMock(false);
      })
      .catch(() => {
        setPromotions(promotionMockData);
        setIsMock(true);
      });
  }, []);

  const visiblePromotions = useMemo(() => promotions.filter((item) => {
    const matchesFilter = filter === "ALL" || item.status === filter || (filter === "MEMBER" && item.memberOnly);
    const text = `${item.title} ${item.code} ${item.description}`.toLowerCase();
    return matchesFilter && text.includes(query.trim().toLowerCase());
  }), [filter, promotions, query]);

  return (
    <div className="space-y-6">
      <header>
        <p className="text-xs font-bold uppercase tracking-[0.2em] text-blue-600">Ưu đãi WashMate</p>
        <h1 className="mt-2 text-3xl font-extrabold text-slate-950">Khám phá ưu đãi phù hợp</h1>
        <p className="mt-2 text-sm text-slate-500">Xem chương trình đang có. Ưu đãi chưa được tự động áp dụng vào booking.</p>
      </header>
      {isMock && <DemoDataNotice />}
      <section className="flex flex-col gap-3 rounded-2xl border border-slate-200 bg-white p-4 lg:flex-row lg:items-center lg:justify-between">
        <div className="flex flex-wrap gap-2">
          {filters.map(([value, label]) => (
            <button key={value} onClick={() => setFilter(value)} className={`rounded-full px-4 py-2 text-xs font-bold ${filter === value ? "bg-blue-600 text-white" : "bg-slate-100 text-slate-600"}`}>{label}</button>
          ))}
        </div>
        <label className="relative min-w-64">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" size={16} />
          <input value={query} onChange={(event) => setQuery(event.target.value)} placeholder="Tìm theo tên hoặc mã..." className="w-full rounded-xl border border-slate-200 py-2.5 pl-10 pr-3 text-sm outline-none focus:border-blue-500" />
        </label>
      </section>
      {visiblePromotions.length === 0 ? (
        <div className="rounded-2xl border border-dashed border-slate-300 bg-white py-16 text-center text-sm text-slate-500">Không có ưu đãi phù hợp bộ lọc.</div>
      ) : (
        <section className="grid gap-5 md:grid-cols-2 xl:grid-cols-3">
          {visiblePromotions.map((item) => (
            <article key={item.id} className="flex min-h-72 flex-col overflow-hidden rounded-3xl border border-slate-200 bg-white shadow-sm">
              <div className="bg-gradient-to-r from-blue-700 to-cyan-500 p-5 text-white">
                <div className="flex items-center justify-between"><BadgePercent size={28} /><span className="rounded-full bg-white/20 px-3 py-1 text-[10px] font-bold">{item.memberOnly ? "THÀNH VIÊN" : "ƯU ĐÃI"}</span></div>
                <p className="mt-5 text-2xl font-black">{item.discountLabel}</p>
              </div>
              <div className="flex flex-1 flex-col p-5">
                <h2 className="font-extrabold text-slate-950">{item.title}</h2>
                <p className="mt-2 text-xs leading-5 text-slate-500">{item.description}</p>
                <div className="mt-auto space-y-2 pt-5 text-[11px] text-slate-500">
                  <p className="flex items-center gap-2"><Tag size={14} /> Mã: <b className="text-slate-800">{item.code || "Tự động"}</b></p>
                  <p className="flex items-center gap-2"><CalendarClock size={14} /> Hạn dùng: {item.expiresAt ? new Date(item.expiresAt).toLocaleDateString("vi-VN") : "Theo chương trình"}</p>
                </div>
              </div>
            </article>
          ))}
        </section>
      )}
    </div>
  );
}
