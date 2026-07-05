# Product

## Register

product

## Users

- **Khách hàng (Customer Portal)**: chủ xe ở Việt Nam đặt lịch rửa xe/giặt là, theo dõi booking, xe, điểm thành viên. Dùng nhiều trên điện thoại, giữa lúc bận — cần đặt lịch nhanh, biết rõ trạng thái.
- **Nhân viên (Staff Portal)**: nhân viên chi nhánh xử lý hàng đợi booking trong ca làm — thao tác lặp lại nhiều lần/ngày, cần tốc độ và trạng thái rõ ràng.
- **Quản trị (Admin Portal)**: quản lý chuỗi chi nhánh xem doanh thu, KPI, khách hàng, cấu hình dịch vụ — làm việc trên desktop, cần mật độ thông tin cao nhưng đọc được ngay.

## Product Purpose

WashMate là SPA đặt lịch rửa xe đa portal (Customer / Staff / Admin) — đồ án SWP301. Thành công = luồng đặt lịch end-to-end mượt, ba portal cảm giác là MỘT sản phẩm thống nhất, và giao diện đủ chỉn chu để không bị nhận ra là "AI dựng".

## Brand Personality

Tin cậy – sạch sẽ – hiệu quả. Xanh dương `#2563eb` là màu thương hiệu duy nhất; nền trắng, chữ slate đậm, bo góc lớn. Tiếng Việt là ngôn ngữ chính của UI. Giọng điệu thân thiện nhưng không màu mè.

## Anti-references

- **Giao diện "AI-generated"**: gradient text, side-stripe borders, hero-metric template, lưới card icon+heading+text lặp vô tận, eyebrow uppercase tracking rộng trên mọi section, glassmorphism trang trí.
- **Bất đồng bộ giữa các portal**: cùng một hành động/trạng thái nhưng nút, badge, spacing, tone màu khác nhau giữa Customer/Staff/Admin — đây là lỗi số 1 cần diệt.
- Dashboard SaaS mẫu (template admin bán sẵn) với KPI card gradient và số to vô hồn.

## Design Principles

1. **Một hệ thống, ba portal** — cùng token, cùng component vocabulary (StatusBadge, PageHeader, PageContainer, button.jsx); nút "Lưu" ở Admin phải trông y hệt ở Staff.
2. **Công cụ biến mất trong công việc** — quen thuộc có chủ đích, không phát minh affordance lạ; mật độ cao ở Admin/Staff là tính năng, không phải lỗi.
3. **Trạng thái luôn hiện rõ** — loading = skeleton, feedback = toast, trạng thái booking = StatusBadge từ status-tones; không màn hình câm.
4. **Token trước, hex không bao giờ** — mọi màu/bóng/bo góc đi qua src/index.css; grep gates trong DESIGN.md phải luôn về 0.
5. **Tiếng Việt tự nhiên** — copy như người Việt viết cho người Việt, không dịch máy từ template tiếng Anh.

## Accessibility & Inclusion

- Mục tiêu WCAG AA: chữ body ≥ 4.5:1 trên nền; không truyền nghĩa chỉ bằng màu (badge luôn kèm label chữ).
- Light-only theo thiết kế; tôn trọng `prefers-reduced-motion` cho mọi animation.
- Touch target ≥ 44px cho Customer Portal (mobile-first).
