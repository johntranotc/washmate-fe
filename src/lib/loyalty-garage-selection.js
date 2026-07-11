// Chia sẻ "chi nhánh loyalty đang xem" giữa trang Điểm thành viên và sidebar.
// Lưu preference của người dùng (không phải dữ liệu nghiệp vụ) để 2 nơi đồng bộ.
const KEY = "wm.loyalty.selectedGarageId";
const EVENT = "wm-loyalty-garage-changed";

export function getStoredGarageId() {
  try {
    const v = localStorage.getItem(KEY);
    return v == null || v === "" ? null : v;
  } catch {
    return null;
  }
}

export function storeGarageId(id) {
  const val = id == null ? "" : String(id);
  try {
    localStorage.setItem(KEY, val);
  } catch {
    /* ignore */
  }
  try {
    window.dispatchEvent(new CustomEvent(EVENT, { detail: val }));
  } catch {
    /* ignore */
  }
}

/** Đăng ký lắng nghe khi chi nhánh đang xem đổi (cùng tab qua CustomEvent, khác tab qua storage). */
export function onGarageChange(cb) {
  const handler = () => cb(getStoredGarageId());
  window.addEventListener(EVENT, handler);
  window.addEventListener("storage", handler);
  return () => {
    window.removeEventListener(EVENT, handler);
    window.removeEventListener("storage", handler);
  };
}
