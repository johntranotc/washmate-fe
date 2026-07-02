# AGENTS.md — WashMate Frontend

Hướng dẫn cho AI coding agent (Antigravity, Claude, Gemini...) khi làm việc trong repo này.

## Design system — BẮT BUỘC đọc trước khi sửa UI

- **`/DESIGN.md` là source of truth về giao diện khu vực Admin** (format
  [google-labs-code/design.md](https://github.com/google-labs-code/design.md)):
  token màu/typography/bo góc/spacing + quy tắc áp dụng nằm ở phần prose.
- Token đã được nối vào build tại `src/styles/design-tokens.css` (import trong
  `src/index.css`), **scope trong class `.wm-admin`** đặt ở `src/layouts/AdminLayout.jsx`.
  Các utility Tailwind (`bg-blue-600`, `text-slate-500`, `bg-amber-100`...) bên trong
  cây Admin tự nhận giá trị token qua cầu nối biến CSS — không cần đổi tên class.
- Muốn đổi màu/hệ thống: sửa `DESIGN.md` → chạy lint → cập nhật giá trị `--adm-*`
  tương ứng trong `src/styles/design-tokens.css`.

### Lệnh design.md

```bash
npx @google/design.md lint DESIGN.md      # validate (phải 0 errors, 0 warnings)
npx @google/design.md export --format css-tailwind DESIGN.md   # sinh token CSS
npx @google/design.md diff DESIGN.md DESIGN-v2.md              # so sánh 2 bản
```

Lưu ý Windows/PowerShell: luôn quote tên package `"@google/design.md"` khi install.

## Ranh giới code — TUYỆT ĐỐI tuân thủ

- Repo backend (`washmate-be`, Spring Boot) chỉ được ĐỌC. Không sửa entity,
  controller, service, route, migration, seed, config của BE.
- Không sửa Customer Portal (`src/pages/customer*`, `src/pages/customer-portal`,
  `src/components/customer*`) trừ khi được yêu cầu rõ ràng.
- `src/styles/theme.css` và theme shadcn trong `src/index.css` (`--primary: #0b8cff`...)
  thuộc Customer Portal — không đè các biến `--color-primary`, `--color-border`,
  `--color-surface`... ở mức `:root`/`@theme`. Token Admin phải nằm trong scope `.wm-admin`.
- Không commit, không push khi chưa được yêu cầu.

## Quy tắc dữ liệu

- Chỉ dùng API thật (`src/api/*` → axiosClient, baseURL `/api`). Không mock/fake
  data cố định, không fake trạng thái thành công.
- BE chưa có endpoint hoặc trả rỗng → hiển thị loading (skeleton) / error (kèm
  nút thử lại) / empty state trung thực, ghi rõ "chờ BE".
- Booking workflow: PENDING → CONFIRMED → CHECKED_IN → WASHING → COMPLETED;
  nhánh kết thúc: CANCELLED / REJECTED / NO_SHOW. Chỉ render action hợp lệ với
  trạng thái hiện tại.
- Bảng dài phân trang 10 dòng (`src/components/common/Pagination.jsx`), badge
  trạng thái dùng `src/components/common/StatusBadge.jsx`.

## Build & kiểm tra

```bash
npm run dev     # vite dev server
npm run build   # bắt buộc pass trước khi kết thúc task
```

Format tiền/ngày dùng helper trong `src/lib/format.js` (formatMoney,
formatMoneyShort — số tiền không bao giờ được hiển thị cắt cụt).
