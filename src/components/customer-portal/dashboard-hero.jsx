import { useEffect, useRef, useState } from "react";
import { useNavigate } from "react-router-dom";
import { Droplets } from "lucide-react";
import { Button } from "@/components/ui/button";
import { getDisplayName } from "@/utils/authUtils";

/**
 * Banner chào mừng trang Tổng quan — FULL-BLEED: nằm ngoài PageContainer,
 * ảnh tràn sát 2 mép và đụng header (không bo góc, không viền trắng).
 * Phần eyebrow "Tổng quan khách hàng" + mô tả được gộp vào trong banner.
 */
export function DashboardHero() {
  const navigate = useNavigate();
  const customerName = getDisplayName("Khách hàng");

  // Chữ trượt vào từ phải; chạy lại mỗi lần cuộn tới (giống hero trang chủ).
  const textRef = useRef(null);
  const [inView, setInView] = useState(false);
  useEffect(() => {
    const el = textRef.current;
    if (!el) return undefined;
    const reduce = window.matchMedia?.("(prefers-reduced-motion: reduce)").matches;
    if (reduce) {
      setInView(true);
      return undefined;
    }
    const io = new IntersectionObserver(([entry]) => setInView(entry.isIntersecting), { threshold: 0.3 });
    io.observe(el);
    return () => io.disconnect();
  }, []);
  const inClass = inView ? "is-in" : "";

  return (
    // -mt-16 kéo banner lên nằm SAU header trong suốt (PortalShell glassHeader chừa pt-16)
    <div className="relative -mt-16 flex min-h-[360px] flex-col justify-start overflow-hidden bg-navy-deep pt-16 md:min-h-[420px]">
      {/* Ảnh hiện nguyên, không phủ xanh — canh lên trên để lộ trọn phần tay/khăn */}
      <img
        src="/images/customer/dashboard-hero.jpg"
        alt=""
        aria-hidden="true"
        className="absolute inset-0 size-full object-cover object-top"
      />
      {/* Vệt tối trung tính bên trái cho chữ đọc rõ */}
      <div
        aria-hidden="true"
        className="absolute inset-0 bg-[linear-gradient(to_right,rgba(8,11,18,0.72)_0%,rgba(8,11,18,0.38)_36%,transparent_64%)]"
      />

      {/* Nội dung canh theo cùng bề rộng với phần trang bên dưới */}
      <div className="relative z-10 mx-auto w-full max-w-7xl px-4 py-10 sm:px-6 lg:px-8">
        <div ref={textRef} className="max-w-2xl">
          <span className={`wm-slide-in ${inClass} inline-flex items-center gap-1.5 rounded-full bg-card/15 px-3 py-1 text-xs font-bold uppercase tracking-wide text-white backdrop-blur-sm`}>
            <Droplets size={14} /> Tổng quan khách hàng
          </span>
          <h1 className={`wm-slide-in ${inClass} mt-3 text-2xl font-extrabold leading-tight text-white [text-shadow:0_2px_14px_rgba(0,0,0,0.55)] md:text-3xl`} style={{ transitionDelay: "120ms" }}>
            Xin chào, {customerName}!
          </h1>
          <p className={`wm-slide-in ${inClass} mt-1.5 text-sm text-white/90 [text-shadow:0_1px_8px_rgba(0,0,0,0.5)]`} style={{ transitionDelay: "240ms" }}>
            Chào mừng bạn quay lại WashMate. Theo dõi lịch rửa xe, phương tiện, điểm thưởng và ưu đãi của bạn.
          </p>
          <div className={`wm-slide-in ${inClass} mt-5 flex flex-wrap gap-3`} style={{ transitionDelay: "360ms" }}>
            <Button
              size="lg"
              onClick={() => navigate("/khach-hang/dat-lich-moi")}
              className="bg-card px-6 text-primary-strong hover:bg-primary-container"
            >
              Đặt lịch mới
            </Button>
            <Button
              variant="outline"
              size="lg"
              onClick={() => navigate("/khach-hang/xe-cua-toi")}
              className="border-white/40 bg-transparent px-6 text-white hover:bg-card/10 hover:text-white"
            >
              Xem xe của tôi
            </Button>
          </div>
        </div>
      </div>
    </div>
  );
}
