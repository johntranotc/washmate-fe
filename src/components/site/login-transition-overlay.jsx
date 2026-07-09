import { useEffect, useRef } from "react";

/**
 * Hiệu ứng chuyển trang khi bấm "Đăng nhập" trên landing page.
 * Xe navy lướt ngang (phải→trái) kèm vệt sáng xanh + ánh nước nhẹ, rồi gọi onComplete.
 *
 * Props:
 *   active     — bật overlay + animation
 *   onComplete — gọi khi animation kết thúc (để điều hướng sang trang đăng nhập)
 *
 * Reduced-motion được xử lý ở nơi trigger (bỏ overlay, điều hướng thẳng),
 * lớp @media trong index.css là dự phòng.
 */
export function LoginTransitionOverlay({ active, onComplete }) {
  const doneRef = useRef(false);

  useEffect(() => {
    if (!active) {
      doneRef.current = false;
      return undefined;
    }
    // Dự phòng nếu sự kiện animationend không kích hoạt (tab ẩn, xe chưa vẽ...).
    const fallback = window.setTimeout(() => finish(), 1700);
    return () => window.clearTimeout(fallback);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [active]);

  function finish() {
    if (doneRef.current) return;
    doneRef.current = true;
    onComplete?.();
  }

  if (!active) return null;

  return (
    <div className="wm-login-overlay" role="presentation" aria-hidden="true">
      <span className="wm-login-streak" />
      <span className="wm-login-dust" />
      {/* rig mang animation chạy ngang; xe + 2 vòng nan hoa xoay bám theo */}
      <div className="wm-login-car-rig" onAnimationEnd={finish}>
        <img src="/images/home/car-side.png" alt="" className="wm-login-car-img" />
        <span className="wm-login-wheel wm-login-wheel--front" />
        <span className="wm-login-wheel wm-login-wheel--rear" />
      </div>
    </div>
  );
}
