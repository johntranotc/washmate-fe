---
version: alpha
name: WashMate Admin
description: Design system cho khu vuc quan tri (Admin/Owner) cua WashMate - he thong rua xe thong minh.
colors:
  primary: "#2563EB"
  on-primary: "#FFFFFF"
  primary-container: "#EFF6FF"
  primary-strong: "#1D4ED8"
  ink: "#0F172A"
  ink-soft: "#334155"
  secondary: "#64748B"
  muted: "#94A3B8"
  neutral: "#F8FAFC"
  surface: "#FFFFFF"
  border: "#E2E8F0"
  success: "#047857"
  success-container: "#D1FAE5"
  warning: "#B45309"
  warning-container: "#FEF3C7"
  critical: "#B91C1C"
  critical-container: "#FEE2E2"
  no-show: "#C2410C"
  no-show-container: "#FFEDD5"
  accent-cyan: "#0E7490"
  accent-indigo: "#4338CA"
  accent-violet: "#6D28D9"
  chart-1: "#2563EB"
  chart-2: "#F59E0B"
  chart-3: "#8B5CF6"
  chart-4: "#10B981"
  chart-5: "#64748B"
typography:
  h1:
    fontFamily: Be Vietnam Pro
    fontSize: 1.875rem
    fontWeight: 800
    lineHeight: 1.2
  h2-section:
    fontFamily: Be Vietnam Pro
    fontSize: 1rem
    fontWeight: 800
    lineHeight: 1.4
  kpi-value:
    fontFamily: Be Vietnam Pro
    fontSize: 1.375rem
    fontWeight: 900
    lineHeight: 1.2
    letterSpacing: -0.01em
  body-md:
    fontFamily: Be Vietnam Pro
    fontSize: 0.875rem
    fontWeight: 400
    lineHeight: 1.5
  label:
    fontFamily: Be Vietnam Pro
    fontSize: 0.75rem
    fontWeight: 700
    lineHeight: 1.4
  label-caps:
    fontFamily: Be Vietnam Pro
    fontSize: 0.625rem
    fontWeight: 700
    lineHeight: 1.3
    letterSpacing: 0.05em
rounded:
  sm: 8px
  md: 12px
  lg: 16px
  pill: 999px
spacing:
  xs: 4px
  sm: 8px
  md: 16px
  lg: 24px
  xl: 32px
components:
  button-primary:
    backgroundColor: "{colors.primary}"
    textColor: "{colors.on-primary}"
    rounded: "{rounded.md}"
    padding: 12px
    height: 40px
  button-primary-hover:
    backgroundColor: "{colors.primary-strong}"
    textColor: "{colors.on-primary}"
  button-secondary:
    backgroundColor: "{colors.surface}"
    textColor: "{colors.ink-soft}"
    rounded: "{rounded.md}"
    padding: 12px
    height: 40px
  button-soft:
    backgroundColor: "{colors.primary-container}"
    textColor: "{colors.primary-strong}"
    rounded: "{rounded.md}"
    padding: 12px
    height: 40px
  card:
    backgroundColor: "{colors.surface}"
    rounded: "{rounded.lg}"
    padding: 20px
  page:
    backgroundColor: "{colors.neutral}"
    textColor: "{colors.ink}"
  sidebar:
    backgroundColor: "{colors.ink}"
    textColor: "{colors.muted}"
  badge-success:
    backgroundColor: "{colors.success-container}"
    textColor: "{colors.success}"
    rounded: "{rounded.pill}"
    typography: "{typography.label-caps}"
    padding: 4px
  badge-warning:
    backgroundColor: "{colors.warning-container}"
    textColor: "{colors.warning}"
    rounded: "{rounded.pill}"
    typography: "{typography.label-caps}"
    padding: 4px
  badge-critical:
    backgroundColor: "{colors.critical-container}"
    textColor: "{colors.critical}"
    rounded: "{rounded.pill}"
    typography: "{typography.label-caps}"
    padding: 4px
  badge-info:
    backgroundColor: "{colors.primary-container}"
    textColor: "{colors.primary-strong}"
    rounded: "{rounded.pill}"
    typography: "{typography.label-caps}"
    padding: 4px
  badge-no-show:
    backgroundColor: "{colors.no-show-container}"
    textColor: "{colors.no-show}"
    rounded: "{rounded.pill}"
    typography: "{typography.label-caps}"
    padding: 4px
  input:
    backgroundColor: "{colors.surface}"
    textColor: "{colors.ink}"
    rounded: "{rounded.md}"
    height: 40px
    padding: 12px
  kpi-card:
    backgroundColor: "{colors.surface}"
    textColor: "{colors.ink}"
    typography: "{typography.kpi-value}"
    rounded: "{rounded.lg}"
    padding: 20px
  divider:
    backgroundColor: "{colors.border}"
    height: 1px
  status-checked-in:
    backgroundColor: "{colors.surface}"
    textColor: "{colors.accent-cyan}"
    rounded: "{rounded.pill}"
  status-washing:
    backgroundColor: "{colors.surface}"
    textColor: "{colors.accent-violet}"
    rounded: "{rounded.pill}"
  stat-neutral:
    backgroundColor: "{colors.surface}"
    textColor: "{colors.accent-indigo}"
    rounded: "{rounded.pill}"
  chart-series-1:
    backgroundColor: "{colors.chart-1}"
  chart-series-2:
    backgroundColor: "{colors.chart-2}"
  chart-series-3:
    backgroundColor: "{colors.chart-3}"
  chart-series-4:
    backgroundColor: "{colors.chart-4}"
  chart-series-5:
    backgroundColor: "{colors.chart-5}"
---

## Overview

WashMate là hệ điều hành của một chuỗi gara rửa xe, gồm ba khu vực dùng chung
một ngôn ngữ thị giác: Khách hàng, Nhân viên và Quản trị.

Điểm tham chiếu: **dashboard vận hành của một SaaS thanh toán hiện đại
(Stripe Dashboard / Linear)** — phẳng, viền hairline, nền gần trắng, thẻ trắng
đặc, một màu xanh dương duy nhất cầm toàn bộ tương tác. Không kính mờ, không
ảnh nền, không gradient trang trí diện rộng (ngoại lệ duy nhất: banner chào
trong khu khách hàng). Cảm giác cần đạt: một công cụ làm việc mà nhân viên
mở 8 tiếng mỗi ngày không mỏi mắt — trung tính, mật độ cao nhưng trật tự,
mọi con số đọc được ngay.

Mỗi trang theo cùng một nhịp: header (tiêu đề + mô tả một câu + hành động) →
bộ lọc → KPI → nội dung phân tích/bảng. Khu khách hàng dùng sidebar trắng,
khu nhân viên và quản trị dùng sidebar Ink — cùng cấu trúc, khác tông để phân
vai, nhưng chung primary, chung font, chung nhịp bo góc và spacing.

## Colors

Bảng màu neo trên bộ trung tính slate và một primary xanh dương duy nhất.

- **Primary (#2563EB):** màu hành động duy nhất — nút chính, link, tab active,
  đường doanh thu trên chart. Không dùng cho trang trí diện rộng.
- **Primary strong (#1D4ED8)** trên **Primary container (#EFF6FF):** trạng thái
  hover và các khối nhấn nhẹ (soft button, badge info).
- **Ink (#0F172A):** tiêu đề, số liệu KPI và nền sidebar. **Ink soft (#334155)**
  cho chữ trên nút thứ cấp.
- **Secondary (#64748B)** cho mô tả; **Muted (#94A3B8)** cho metadata, nhãn cột,
  chữ điều hướng trên sidebar tối.
- **Neutral (#F8FAFC)** là nền trang; **Surface (#FFFFFF)** là nền thẻ;
  **Border (#E2E8F0)** cho toàn bộ viền.
- Ngữ nghĩa trạng thái: **Success (#047857 / nền #D1FAE5)** cho hoàn thành và
  hoạt động; **Warning (#B45309 / nền #FEF3C7)** cho chờ xử lý, quá tải — LUÔN
  dùng thang amber, không dùng orange; **Critical (#B91C1C / nền #FEE2E2)** cho
  hủy, lỗi, cảnh báo nghiêm trọng — LUÔN dùng thang red, không dùng rose.
- Accent mở rộng chỉ dành cho phân biệt trạng thái/danh mục khi các màu ngữ
  nghĩa đã dùng hết: **accent-cyan** (đã check-in), **accent-indigo** (nhóm
  đếm trung tính), **accent-violet** (đang rửa, vai trò quản lý).
- Data-viz dùng đúng thứ tự **chart-1 → chart-5**; hai chuỗi trên cùng một
  biểu đồ phải khác họ màu rõ rệt (xanh dương + cam), không đặt xanh dương
  cạnh tím.

## Typography

Toàn hệ thống dùng một font **Be Vietnam Pro** (đã nạp toàn cục) — hỗ trợ đầy đủ
tiếng Việt, nét hình học hiện đại.

- **h1 (30px/800):** tiêu đề trang, mỗi trang đúng một lần.
- **h2-section (16px/800):** tiêu đề thẻ/khối nội dung.
- **kpi-value (22px/900, tracking âm nhẹ):** con số lớn trên KPI card; giá trị
  tiền tệ không bao giờ bị cắt cụt — dùng dạng rút gọn có nghĩa ("125,68 Tr đ")
  kèm giá trị đầy đủ cỡ nhỏ bên dưới.
- **body-md (14px/400):** nội dung, mô tả.
- **label (12px/700):** nhãn phụ, nút cỡ nhỏ, ô bảng.
- **label-caps (10px/700, giãn cách 5%):** đầu cột bảng viết hoa, badge.

## Layout

Trang admin dùng khung `max-width 1600px`, căn giữa, padding 32px trên desktop
(16px mobile). Sidebar cố định 256px nền Ink. Lưới nội dung chia
`1fr + 340–400px` khi có cột phụ (insight/cảnh báo). Nhịp spacing theo thang
4/8/16/24/32px: 16px giữa phần tử trong thẻ, 20px padding thẻ, 20–24px giữa các
thẻ. Bảng dài bắt buộc phân trang 10 dòng; không trang nào cuộn vô hạn.

## Elevation & Depth

Ba mức: nền phẳng (neutral) → thẻ nổi nhẹ (`shadow-sm`, viền border) → lớp nổi
khi hover (`shadow-md`) và modal (overlay slate-900/40 + `shadow-xl`).
Không dùng bóng đổ đậm màu; chiều sâu đến từ viền + bóng mảnh, giữ cảm giác matte.

## Shapes

Bo góc là dấu ấn nhận diện: thẻ và modal dùng **lg (16px)**; nút, input, select
dùng **md (12px)**; ô nhỏ trong thẻ dùng **sm (8px)**; badge và chip trạng thái
dùng **pill**. Icon đặt trong ô vuông bo md/lg với nền container nhạt cùng họ màu.

## Components

- **button-primary:** nền primary, chữ trắng, cao 40px — mỗi khu vực chỉ một
  hành động chính.
- **button-secondary:** nền surface + viền border, chữ ink-soft — hành động phụ
  ("Tải lại", "Hủy").
- **button-soft:** nền primary-container, chữ primary-strong — hành động nhấn
  nhẹ ("Làm mới phân tích").
- **card:** surface, bo lg, padding 20px, viền border + shadow-sm; hover nâng
  lên shadow-md với thẻ tương tác được.
- **badge-{success|warning|critical|info}:** pill, label-caps, cặp màu
  container/text theo đúng ngữ nghĩa; trạng thái booking ánh xạ: COMPLETED →
  success, PENDING/WASHING chờ xử lý → warning/violet, CANCELLED/REJECTED/
  NO_SHOW → critical, CONFIRMED → info.
- **input:** cao 40px, bo md, viền border, focus đổi viền sang primary (không
  đổ bóng ngoài).
- **kpi-card:** icon trong ô container màu nhạt góc phải, nhãn label, số
  kpi-value, phụ đề muted, chip trend (xanh success khi tốt lên, critical khi
  xấu đi — chiều "tốt" phụ thuộc chỉ số).
- **sidebar:** nền ink, item bo md, active nền primary chữ trắng, còn lại chữ
  muted hover sáng dần.

## Do's and Don'ts

- **Do:** gọi API thật; mọi khu vực dữ liệu phải có đủ loading (skeleton),
  error (kèm nút thử lại) và empty state có hướng dẫn.
- **Do:** format tiền `vi-VN` ("10.020.000 đ"), ngày `dd/MM/yyyy`; số lớn dùng
  formatMoneyShort kèm giá trị đầy đủ.
- **Do:** biểu đồ phải có legend, tooltip, trục rõ; ≤ 32 điểm thì hiện chấm
  tại từng điểm dữ liệu.
- **Don't:** không hardcode dữ liệu giả hoặc fake trạng thái thành công khi
  backend chưa hỗ trợ — hiển thị trạng thái "chờ BE" trung thực.
- **Don't:** không dùng orange thay amber, không dùng rose thay red, không thêm
  màu mới ngoài palette khi chưa bổ sung vào file này. Ngoại lệ duy nhất của họ
  orange là cặp token **no-show** — hue riêng cho trạng thái NO_SHOW để không
  trùng PENDING (amber) và REJECTED (red).
- **Don't:** không để giá trị số bị truncate, không render bảng quá 10 dòng
  không phân trang, không dùng quá một nút primary trong một khu vực.
- **Don't:** không dùng glassmorphism — không `backdrop-blur`, không bề mặt
  bán trong suốt (`bg-white/40`...), không ảnh nền sau nội dung, không bóng đổ
  màu. Stripe không làm thế, WashMate cũng không.
- **Don't:** không dùng bo góc lớn hơn 16px cho container (không `rounded-3xl`);
  sidebar ẩn-hiện theo hover là cấm — điều hướng phải luôn đọc được nhãn.
