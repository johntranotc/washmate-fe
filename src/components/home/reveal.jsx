import { useEffect, useRef, useState } from "react";

/**
 * Bọc một khối nội dung để nó mờ dần + trồi lên khi cuộn tới (scroll-reveal).
 * Dùng IntersectionObserver, chạy một lần. Tôn trọng prefers-reduced-motion (hiện ngay).
 * Props: delay (ms, để tạo hiệu ứng so le), className (thêm), as (thẻ bọc, mặc định div).
 */
export function Reveal({ children, delay = 0, className = "" }) {
  const ref = useRef(null);
  const [shown, setShown] = useState(false);

  useEffect(() => {
    const el = ref.current;
    if (!el) return undefined;
    const reduce = window.matchMedia?.("(prefers-reduced-motion: reduce)").matches;
    if (reduce) {
      setShown(true);
      return undefined;
    }
    const io = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) {
            setShown(true);
            io.disconnect();
          }
        });
      },
      { threshold: 0.12, rootMargin: "0px 0px -8% 0px" },
    );
    io.observe(el);
    return () => io.disconnect();
  }, []);

  return (
    <div
      ref={ref}
      className={`wm-reveal ${shown ? "is-shown" : ""} ${className}`.trim()}
      style={delay ? { transitionDelay: `${delay}ms` } : undefined}
    >
      {children}
    </div>
  );
}

export default Reveal;
