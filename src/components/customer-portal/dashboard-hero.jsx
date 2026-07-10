import { useEffect, useRef, useState } from "react";
import { useNavigate } from "react-router-dom";
import { ChevronLeft, ChevronRight } from "lucide-react";
import { Button } from "@/components/ui/button";
import { getDisplayName } from "@/utils/authUtils";

/**
 * Banner chào mừng trang Tổng quan — FULL-BLEED: nằm ngoài PageContainer,
 * ảnh tràn sát 2 mép và đụng header (không bo góc, không viền trắng).
 * Phần eyebrow "Tổng quan khách hàng" + mô tả được gộp vào trong banner.
 */
// Slideshow banner: dùng ảnh hiện có + ảnh bạn thêm sau. Ảnh nào chưa tồn tại sẽ tự bị loại (không lỗi).
const HERO_SLIDES = [
  "/images/customer/dashboard-hero.jpg",
  "/images/customer/dashboard-hero-2.jpg",
  "/images/customer/dashboard-hero-3.jpg",
];

export function DashboardHero() {
  const navigate = useNavigate();
  const customerName = getDisplayName("Khách hàng");

  // Slideshow: 5 giây đổi 1 ảnh, trượt từ phải sang trái. Bấm tay reset lại đồng hồ 5 giây.
  const [slides, setSlides] = useState(HERO_SLIDES);
  const [slide, setSlide] = useState(0);
  useEffect(() => {
    if (slides.length <= 1) return undefined;
    const id = window.setInterval(() => setSlide((i) => (i + 1) % slides.length), 5000);
    return () => window.clearInterval(id);
  }, [slides.length, slide]);
  const safeSlide = slides.length ? slide % slides.length : 0;
  const goNext = () => setSlide((i) => (i + 1) % slides.length);
  const goPrev = () => setSlide((i) => (i - 1 + slides.length) % slides.length);

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
      {/* Slideshow: các ảnh xếp ngang, trượt sang trái mỗi 5 giây */}
      <div className="absolute inset-0 overflow-hidden">
        <div
          className="flex h-full transition-transform duration-700 ease-out motion-reduce:transition-none"
          style={{ width: `${slides.length * 100}%`, transform: `translateX(-${safeSlide * (100 / slides.length)}%)` }}
        >
          {slides.map((src) => (
            <img
              key={src}
              src={src}
              alt=""
              aria-hidden="true"
              onError={() => setSlides((prev) => (prev.length > 1 ? prev.filter((s) => s !== src) : prev))}
              className="h-full shrink-0 object-cover object-top"
              style={{ width: `${100 / slides.length}%` }}
            />
          ))}
        </div>
      </div>
      {/* Vệt tối trung tính bên trái cho chữ đọc rõ */}
      <div
        aria-hidden="true"
        className="absolute inset-0 bg-[linear-gradient(to_right,rgba(8,11,18,0.72)_0%,rgba(8,11,18,0.38)_36%,transparent_64%)]"
      />

      {/* Nội dung canh theo cùng bề rộng với phần trang bên dưới */}
      <div className="relative z-10 mx-auto w-full max-w-7xl px-4 py-10 sm:px-6 lg:px-8">
        <div ref={textRef} className="max-w-2xl">
          <h1 className={`wm-slide-in ${inClass} text-2xl font-extrabold leading-tight text-white [text-shadow:0_2px_14px_rgba(0,0,0,0.55)] md:text-3xl`} style={{ transitionDelay: "250ms" }}>
            Xin chào, {customerName}!
          </h1>
          <p className={`wm-slide-in ${inClass} mt-1.5 text-sm text-white/90 [text-shadow:0_1px_8px_rgba(0,0,0,0.5)]`} style={{ transitionDelay: "600ms" }}>
            Chào mừng bạn quay lại WashMate. Theo dõi lịch rửa xe, phương tiện, điểm thưởng và ưu đãi của bạn.
          </p>
          <div className={`wm-slide-in ${inClass} mt-5 flex flex-wrap gap-3`} style={{ transitionDelay: "950ms" }}>
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

      {/* Điều hướng slideshow: mũi tên + chấm (bấm để chuyển ảnh) */}
      {slides.length > 1 && (
        <div className="absolute bottom-4 right-4 z-20 flex items-center gap-1.5 rounded-full bg-black/30 px-2 py-1.5 backdrop-blur-sm">
          <button
            type="button"
            onClick={goPrev}
            aria-label="Ảnh trước"
            className="grid size-7 place-items-center rounded-full text-white/90 transition hover:bg-white/20"
          >
            <ChevronLeft size={16} />
          </button>
          <div className="flex items-center gap-1.5 px-1">
            {slides.map((src, i) => (
              <button
                key={src}
                type="button"
                onClick={() => setSlide(i)}
                aria-label={`Chuyển tới ảnh ${i + 1}`}
                className={`h-1.5 rounded-full transition-all ${
                  i === safeSlide ? "w-5 bg-white" : "w-1.5 bg-white/50 hover:bg-white/80"
                }`}
              />
            ))}
          </div>
          <button
            type="button"
            onClick={goNext}
            aria-label="Ảnh sau"
            className="grid size-7 place-items-center rounded-full text-white/90 transition hover:bg-white/20"
          >
            <ChevronRight size={16} />
          </button>
        </div>
      )}
    </div>
  );
}
