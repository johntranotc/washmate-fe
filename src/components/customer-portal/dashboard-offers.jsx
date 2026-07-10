import { useCallback, useEffect, useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { BadgePercent, CalendarClock, Check, Copy, Gift } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";
import { toast } from "@/components/ui/toast";
import { promotionApi } from "@/api/promotionApi";
import { garageApi } from "@/api/garageApi";
import { formatBookingDate } from "@/lib/customer-booking-data";
import { daysLeft, discountLabel, normalizePromotion, promotionTitle } from "@/lib/customer-promotion-data";

const MAX = 4;

function asList(res) {
  if (Array.isArray(res)) return res;
  return res?.data ?? res?.content ?? [];
}

/**
 * "Ưu đãi dành cho bạn" trên trang Tổng quan — dữ liệu THẬT.
 * Gộp ưu đãi khả dụng của các chi nhánh (BE lọc theo khách + hạn + lượt). Ẩn khối nếu lỗi.
 */
export function DashboardOffers() {
  const navigate = useNavigate();
  const [promos, setPromos] = useState([]);
  const [loading, setLoading] = useState(true);
  const [failed, setFailed] = useState(false);

  const load = useCallback(async () => {
    setLoading(true);
    setFailed(false);
    try {
      const garages = asList(await garageApi.getAll());
      if (!garages.length) {
        setPromos([]);
        return;
      }
      const results = await Promise.allSettled(
        garages.map((g) =>
          promotionApi
            .getPromotions({ garageId: g.garageId ?? g.id })
            .then((res) => asList(res).map((p) => normalizePromotion(p, g.name || g.garageName || ""))),
        ),
      );
      const merged = [];
      const seen = new Set();
      for (const r of results) {
        if (r.status !== "fulfilled") continue;
        for (const p of r.value) {
          if (!p || seen.has(p.id)) continue;
          seen.add(p.id);
          merged.push(p);
        }
      }
      merged.sort((a, b) => daysLeft(a) - daysLeft(b));
      setPromos(merged);
    } catch {
      setFailed(true);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    load();
  }, [load]);

  // Lỗi tải → ẩn khối để không làm rối dashboard.
  if (failed) return null;

  return (
    <section className="flex h-full flex-col rounded-2xl border border-border bg-card p-5">
      <div className="mb-3 flex items-center justify-between">
        <h2 className="text-lg font-extrabold">Ưu đãi dành cho bạn</h2>
        <Link to="/khach-hang/uu-dai" className="text-sm font-semibold text-primary hover:underline">
          Xem tất cả
        </Link>
      </div>

      {loading ? (
        <div className="grid gap-3 sm:grid-cols-2">
          {Array.from({ length: MAX }).map((_, i) => (
            <Skeleton key={i} className="h-40 rounded-2xl" />
          ))}
        </div>
      ) : promos.length === 0 ? (
        <div className="flex flex-col items-center rounded-2xl border border-dashed border-border bg-card px-6 py-10 text-center">
          <span className="grid size-11 place-items-center rounded-full bg-primary/10 text-primary">
            <Gift size={20} />
          </span>
          <p className="mt-3 text-sm font-semibold text-foreground">Chưa có ưu đãi khả dụng</p>
          <p className="mt-1 text-xs text-muted-foreground">Ưu đãi mới sẽ xuất hiện tại đây khi có chương trình.</p>
        </div>
      ) : (
        <div className="grid gap-3 sm:grid-cols-2">
          {promos.slice(0, MAX).map((promo) => (
            <OfferCard key={promo.id} promo={promo} onUse={() => navigate("/khach-hang/dat-lich-moi")} />
          ))}
        </div>
      )}
    </section>
  );
}

function OfferCard({ promo, onUse }) {
  const [copied, setCopied] = useState(false);
  const d = daysLeft(promo);
  const copyCode = () => {
    if (!promo.code) return;
    navigator.clipboard?.writeText(promo.code).catch(() => {});
    setCopied(true);
    toast.success("Đã sao chép mã ưu đãi.");
    window.setTimeout(() => setCopied(false), 2000);
  };

  return (
    <article className="flex flex-col overflow-hidden rounded-2xl border border-border bg-card shadow-card">
      <div className="flex items-center justify-between bg-[linear-gradient(120deg,var(--primary),var(--primary-strong))] px-4 py-3 text-primary-foreground">
        <BadgePercent size={18} />
        <span className="text-xl font-black">{discountLabel(promo)}</span>
      </div>
      <div className="flex flex-1 flex-col p-4">
        <p className="line-clamp-2 text-sm font-bold">{promotionTitle(promo)}</p>
        {promo.code && (
          <button
            type="button"
            onClick={copyCode}
            className="mt-2 inline-flex w-fit items-center gap-1.5 rounded-lg border border-dashed border-primary/40 bg-primary-container/30 px-2 py-1 font-mono text-xs font-bold text-primary transition hover:bg-primary-container/60"
          >
            {copied ? <Check size={12} /> : <Copy size={12} />} {promo.code}
          </button>
        )}
        <p className="mt-2 inline-flex items-center gap-1.5 text-xs text-muted-foreground">
          <CalendarClock size={12} />
          {d != null && d >= 0 && d <= 7 ? (
            <span className="font-semibold text-warning">{d === 0 ? "Hết hạn hôm nay" : `Còn ${d} ngày`}</span>
          ) : (
            <>Hạn: {promo.endDate ? formatBookingDate(promo.endDate) : "Theo chương trình"}</>
          )}
        </p>
        <Button size="sm" className="mt-3 w-full" onClick={onUse}>
          Dùng ngay
        </Button>
      </div>
    </article>
  );
}

export default DashboardOffers;
