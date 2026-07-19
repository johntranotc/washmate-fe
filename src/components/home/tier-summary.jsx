import { useEffect, useMemo, useState } from "react";
import { ArrowRight, CalendarCheck, Crown, Droplet, Gem, Gift, Sparkles, Star } from "lucide-react";
import { Link } from "react-router-dom";
import { tiers as INTRO_TIERS } from "@/lib/site-data";
import { tierLabel, tierSlug } from "@/components/customer-portal/tier-badge";
import { loyaltyApi } from "@/api/loyaltyApi";
import { getAuthItem } from "@/utils/authUtils";
import { getStoredGarageId } from "@/lib/loyalty-garage-selection";
import { formatNumber } from "@/lib/format";

// Ảnh huy hiệu theo slug hạng — cùng bộ medal premium dùng ở trang chủ/Admin.
const MEDALS = {
  bronze: "/images/home/04_membership/medals/medal_dong.png?v=4",
  silver: "/images/home/04_membership/medals/medal_bac.png?v=4",
  gold: "/images/home/04_membership/medals/medal_vang.png?v=4",
  platinum: "/images/home/04_membership/medals/medal_bach_kim.png?v=4",
  diamond: "/images/home/04_membership/medals/medal_kim_cuong.png?v=4",
};

// Icon đặc quyền riêng cho từng hạng (theo art direction của ảnh thiết kế gốc).
const PERK_ICONS = {
  bronze: Droplet,
  silver: CalendarCheck,
  gold: Star,
  platinum: Gift,
  diamond: Crown,
};

// Nền sao lấp lánh: chấm trắng nhỏ rải tay (không random khi render để ổn định).
// Sao xanh nhạt đi qua token --primary-bright (pha sáng bằng color-mix, không hex lạ).
const STAR_BLUE = "color-mix(in srgb, var(--primary-bright) 55%, white)";
const STARS =
  "radial-gradient(1.5px 1.5px at 8% 22%, rgba(255,255,255,0.9), transparent), " +
  "radial-gradient(1px 1px at 21% 68%, rgba(255,255,255,0.7), transparent), " +
  `radial-gradient(2px 2px at 33% 15%, color-mix(in srgb, ${STAR_BLUE} 90%, transparent), transparent), ` +
  "radial-gradient(1px 1px at 44% 51%, rgba(255,255,255,0.6), transparent), " +
  "radial-gradient(1.5px 1.5px at 58% 26%, rgba(255,255,255,0.85), transparent), " +
  `radial-gradient(1px 1px at 67% 74%, color-mix(in srgb, ${STAR_BLUE} 70%, transparent), transparent), ` +
  "radial-gradient(2px 2px at 79% 18%, rgba(255,255,255,0.8), transparent), " +
  "radial-gradient(1px 1px at 88% 56%, rgba(255,255,255,0.65), transparent), " +
  `radial-gradient(1.5px 1.5px at 95% 33%, color-mix(in srgb, ${STAR_BLUE} 85%, transparent), transparent), ` +
  "radial-gradient(1px 1px at 14% 88%, rgba(255,255,255,0.55), transparent), " +
  "radial-gradient(1px 1px at 51% 90%, rgba(255,255,255,0.5), transparent), " +
  "radial-gradient(1.5px 1.5px at 72% 41%, rgba(255,255,255,0.75), transparent)";

/**
 * Khối "Hạng thành viên" trang chủ — thiết kế premium navy (medal 3D, nền sao).
 * Dữ liệu: khách CHƯA đăng nhập xem bản giới thiệu chương trình (site-data, có
 * disclaimer); khách ĐÃ đăng nhập và từng chọn chi nhánh loyalty thì mốc điểm +
 * mức giảm được thay bằng dữ liệu THẬT từ GET /v1/customer/loyalty/tiers?garageId.
 * (Không gọi API khi chưa đăng nhập — endpoint cần token, tránh bị đá về /dang-nhap.)
 */
export function TierSummary() {
  const [realTiers, setRealTiers] = useState(null); // null = dùng bản giới thiệu

  useEffect(() => {
    const token = getAuthItem("accessToken") || getAuthItem("token");
    const garageId = getStoredGarageId();
    if (!token || !garageId) return;
    let alive = true;
    loyaltyApi
      .getCustomerTiers(garageId)
      .then((res) => {
        const list = Array.isArray(res) ? res : res?.items || [];
        if (alive && list.length) setRealTiers(list);
      })
      .catch(() => {}); // lỗi/hết hạn phiên → giữ bản giới thiệu, không phá trang chủ
    return () => {
      alive = false;
    };
  }, []);

  // Ghép dữ liệu thật (tên/mốc điểm/mức giảm từ BE) vào khung hiển thị theo slug;
  // medal + đặc quyền mô tả lấy theo bậc tương ứng trong bộ giới thiệu.
  const display = useMemo(() => {
    if (!realTiers) return INTRO_TIERS.map((t) => ({ ...t, key: t.name }));
    return [...realTiers]
      .sort((a, b) => (a.minPoints ?? 0) - (b.minPoints ?? 0))
      .map((t, i) => {
        const slug = tierSlug(t.tierName || t.name);
        const intro = INTRO_TIERS.find((x) => tierSlug(x.name) === slug) || INTRO_TIERS[Math.min(i, INTRO_TIERS.length - 1)];
        return {
          key: t.id ?? `${t.tierName}-${i}`,
          name: tierLabel(t.tierName || t.name, intro.name),
          condition: `Từ ${formatNumber(t.minPoints ?? 0)} điểm`,
          discount: `Giảm ${t.discountPercentage ?? 0}%`,
          perk: intro.perk,
          medal: slug ? MEDALS[slug] : intro.medal,
          color: intro.color,
        };
      });
  }, [realTiers]);

  return (
    <section id="hang-thanh-vien" className="relative overflow-hidden bg-navy-deep py-16 lg:py-24">
      {/* Nhấp nháy sao chậm — tắt khi người dùng giảm chuyển động */}
      <style>{`
        @keyframes wm-twinkle { 0%, 100% { opacity: 0.35; } 50% { opacity: 0.9; } }
        .wm-stars { animation: wm-twinkle 5s ease-in-out infinite; }
        .wm-stars-alt { animation: wm-twinkle 7s ease-in-out 2.2s infinite; }
        @media (prefers-reduced-motion: reduce) {
          .wm-stars, .wm-stars-alt { animation: none; opacity: 0.6; }
        }
      `}</style>

      {/* Vầng sáng đỉnh section */}
      <div
        aria-hidden="true"
        className="pointer-events-none absolute inset-0 bg-[radial-gradient(ellipse_at_50%_-20%,rgba(37,99,235,0.35),transparent_60%)]"
      />
      {/* Hai lớp sao lệch pha cho cảm giác lấp lánh */}
      <div aria-hidden="true" className="wm-stars pointer-events-none absolute inset-0" style={{ backgroundImage: STARS }} />
      <div
        aria-hidden="true"
        className="wm-stars-alt pointer-events-none absolute inset-0 -scale-x-100"
        style={{ backgroundImage: STARS }}
      />
      {/* Chân trời phát sáng phía dưới như ảnh thiết kế */}
      <div
        aria-hidden="true"
        className="pointer-events-none absolute inset-x-0 bottom-0 h-56 bg-[radial-gradient(ellipse_at_50%_135%,rgba(59,130,246,0.4),transparent_65%)]"
      />

      <div className="relative mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        <div className="mx-auto flex max-w-4xl flex-col items-center gap-4 text-center">
          <span className="inline-flex items-center gap-2 rounded-full border border-white/15 bg-card/10 px-3.5 py-1.5 text-sm font-semibold text-primary-bright">
            <Gem className="size-4" />
            Hạng thành viên
          </span>
          <h2 className="text-balance text-3xl font-extrabold tracking-tight text-white sm:text-4xl lg:text-5xl">
            Càng gắn bó, <span className="text-primary-bright">càng nhiều đặc quyền</span>
          </h2>
          <p className="max-w-2xl text-pretty leading-relaxed text-primary-container/80">
            5 hạng thành viên được đồng bộ trên toàn hệ thống WashMate. Tích điểm
            khi sử dụng dịch vụ và tự động nâng hạng khi đạt đủ điểm.
          </p>
        </div>

        <div className="mt-14 grid grid-cols-2 gap-4 sm:grid-cols-3 lg:grid-cols-5 lg:gap-5">
          {display.map((tier) => {
            const slug = tierSlug(tier.name);
            const PerkIcon = PERK_ICONS[slug] || Sparkles;
            return (
              <article
                key={tier.key}
                className="group relative flex flex-col items-center overflow-hidden rounded-2xl border border-[color-mix(in_srgb,var(--tier)_50%,transparent)] px-5 pb-7 pt-9 text-center transition-[transform,border-color] duration-300 ease-out hover:border-[color-mix(in_srgb,var(--tier)_90%,transparent)] motion-safe:hover:-translate-y-1.5"
                style={{
                  "--tier": tier.color,
                  background:
                    "linear-gradient(180deg, color-mix(in srgb, var(--tier) 22%, rgba(5,12,30,0.92)), rgba(8,17,40,0.88) 58%, color-mix(in srgb, var(--tier) 8%, rgba(8,17,40,0.9)))",
                }}
              >
                {/* Quầng sáng kim loại theo màu hạng, tỏa sau huy hiệu */}
                <span
                  aria-hidden="true"
                  className="pointer-events-none absolute -top-16 left-1/2 size-52 -translate-x-1/2 rounded-full opacity-60 blur-2xl transition-opacity duration-300 group-hover:opacity-100"
                  style={{ background: "color-mix(in srgb, var(--tier) 36%, transparent)" }}
                />
                <img
                  src={tier.medal}
                  alt={`Huy hiệu hạng ${tier.name}`}
                  className="relative size-28 object-contain transition-transform duration-300 ease-out motion-safe:group-hover:scale-105 lg:size-32"
                />
                <strong
                  className="mt-5 text-2xl font-extrabold tracking-tight"
                  style={{ color: "color-mix(in srgb, var(--tier) 68%, white)" }}
                >
                  {tier.name}
                </strong>
                <span className="mt-1.5 text-sm text-white/70">{tier.condition}</span>
                <span
                  className="mt-5 w-full rounded-xl border py-2.5 text-base font-bold"
                  style={{
                    borderColor: "color-mix(in srgb, var(--tier) 60%, transparent)",
                    background: "color-mix(in srgb, var(--tier) 15%, rgba(255,255,255,0.04))",
                    color: "color-mix(in srgb, var(--tier) 55%, white)",
                  }}
                >
                  {tier.discount}
                </span>
                {tier.perk ? (
                  <span className="mt-5 flex items-center justify-center gap-2 text-xs font-medium leading-relaxed text-white/80">
                    <PerkIcon
                      className="size-4 shrink-0"
                      style={{ color: "color-mix(in srgb, var(--tier) 60%, white)" }}
                    />
                    {tier.perk}
                  </span>
                ) : null}
              </article>
            );
          })}
        </div>

        <div className="mt-10 flex flex-col items-center gap-4 text-center">
          <p className="text-xs text-primary-container/65">
            {realTiers
              ? "* Mốc điểm và mức giảm theo chi nhánh bạn đang tích điểm."
              : "* Ưu đãi có thể thay đổi theo chương trình. Vui lòng kiểm tra chi tiết trong ứng dụng WashMate."}
          </p>
          <Link
            to="/tiers"
            className="group inline-flex items-center gap-2 rounded-xl border border-white/15 bg-card/10 px-5 py-2.5 text-sm font-bold text-primary-bright transition-colors hover:border-primary-bright/50 hover:text-white"
          >
            Khám phá quyền lợi từng hạng
            <ArrowRight className="size-4 transition-transform duration-300 ease-out group-hover:translate-x-0.5" />
          </Link>
        </div>
      </div>
    </section>
  );
}
