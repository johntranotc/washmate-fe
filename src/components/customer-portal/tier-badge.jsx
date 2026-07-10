import { useState } from "react";
import { Award, Crown, Gem, Medal, Trophy } from "lucide-react";

const FALLBACK_ICONS = [Medal, Award, Trophy, Crown, Gem];
const COMBINING_MARKS = /[̀-ͯ]/g;

// Màu nhận diện theo bậc hạng (kim loại) — không có token semantic tương ứng nên
// dùng bảng màu riêng, khu biệt cho huy hiệu hạng. Nền nhạt để huy hiệu nổi, sang.
const TIER_STYLES = {
  bronze: {
    bg: "bg-[#e7c6a1]", icon: "text-[#9a531f]", ring: "ring-[#c58f56]/50",
    card: "bg-[linear-gradient(120deg,#e6c3a0,#f6e6d3)]", border: "border-[#cf9c68]/60", bar: "bg-[#9a531f]",
  },
  silver: {
    bg: "bg-[#dfe4ea]", icon: "text-[#69788a]", ring: "ring-[#a9b4c1]/60",
    card: "bg-[linear-gradient(120deg,#d6dde6,#eef1f5)]", border: "border-[#a9b4c1]/60", bar: "bg-[#69788a]",
  },
  gold: {
    bg: "bg-[#f2e0a0]", icon: "text-[#a97e12]", ring: "ring-[#d8b545]/60",
    card: "bg-[linear-gradient(120deg,#f0dc95,#fbf2d4)]", border: "border-[#d8b545]/60", bar: "bg-[#a97e12]",
  },
  platinum: {
    bg: "bg-[#dbe2ea]", icon: "text-[#6f7f92]", ring: "ring-[#a3b1c1]/60",
    card: "bg-[linear-gradient(120deg,#d2dbe5,#eef1f5)]", border: "border-[#a3b1c1]/60", bar: "bg-[#6f7f92]",
  },
  diamond: {
    bg: "bg-[#c4e8f5]", icon: "text-[#2189aa]", ring: "ring-[#6dc7e4]/60",
    card: "bg-[linear-gradient(120deg,#bde5f3,#e4f6fc)]", border: "border-[#7fcfe8]/70", bar: "bg-[#2189aa]",
  },
  default: {
    bg: "bg-primary/10", icon: "text-primary", ring: "ring-primary/20",
    card: "bg-[linear-gradient(120deg,var(--primary-container),var(--card))]", border: "border-primary/20", bar: "bg-primary",
  },
};

/** Theme màu theo bậc hạng cho khối lớn (hero): nền, viền, chữ nhấn, thanh tiến độ. */
export function tierTheme(name) {
  return TIER_STYLES[tierSlug(name)] || TIER_STYLES.default;
}

const TIER_LABELS_VI = {
  bronze: "Đồng",
  silver: "Bạc",
  gold: "Vàng",
  platinum: "Bạch Kim",
  diamond: "Kim Cương",
};

/** Tên hạng hiển thị tiếng Việt từ tên thật của BE (Bronze→Đồng…); lạ thì giữ nguyên. */
export function tierLabel(name, fallback = "") {
  const slug = tierSlug(name);
  if (slug) return TIER_LABELS_VI[slug];
  return name || fallback;
}

/** Map tên hạng THẬT (BE) → slug ảnh/màu huy hiệu. Không khớp → null. */
export function tierSlug(name) {
  const s = String(name || "")
    .normalize("NFD")
    .replace(COMBINING_MARKS, "")
    .toUpperCase()
    .trim();
  if (s.includes("BRONZE") || s.includes("DONG")) return "bronze";
  if (s.includes("SILVER") || s.includes("BAC")) return "silver";
  if (s.includes("GOLD") || s.includes("VANG")) return "gold";
  if (s.includes("PLATINUM") || s.includes("BACH KIM")) return "platinum";
  if (s.includes("DIAMOND") || s.includes("KIM CUONG")) return "diamond";
  return null;
}

/**
 * Huy hiệu hạng: nền khung tự đổi màu theo bậc hạng.
 * Ưu tiên ảnh /images/loyalty/tiers/{slug}.png; chưa có ảnh (hoặc lỗi) → icon vector cùng tông.
 * Props: name (tên hạng thật), index (chọn icon fallback), size, className (thêm shadow…), iconSize.
 */
export function TierBadge({ name, index = 0, size = "size-10", className = "", iconSize = 20 }) {
  const [failed, setFailed] = useState(false);
  const slug = tierSlug(name);
  const style = TIER_STYLES[slug] || TIER_STYLES.default;
  const Icon = FALLBACK_ICONS[Math.min(index, FALLBACK_ICONS.length - 1)];
  const frame = `grid ${size} shrink-0 place-items-center rounded-xl ring-1 ${style.bg} ${style.ring} ${className}`;

  if (slug && !failed) {
    return (
      <span className={frame}>
        <img
          src={`/images/loyalty/tiers/${slug}.png`}
          alt=""
          aria-hidden="true"
          onError={() => setFailed(true)}
          className="size-[82%] object-contain"
        />
      </span>
    );
  }
  return (
    <span className={`${frame} ${style.icon}`}>
      <Icon size={iconSize} />
    </span>
  );
}

export default TierBadge;
