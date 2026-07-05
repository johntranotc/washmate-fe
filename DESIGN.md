---
name: WashMate
description: Multi-portal laundry booking platform (Customer / Staff / Admin). Blue is the primary brand color, light-only, large-radius card-based UI in the shadcn/ui style on Tailwind v4.

# All values below mirror src/index.css (the single source of truth) and
# src/lib/chart-colors.js (static mirror of --chart-* for Recharts).
# If a color changes in code, update this file too — both sides must
# always stay in sync.
colors:
  # Brand (Primary)
  primary: "#2563eb"              # main brand — CTA buttons, links, active state, focus ring
  primary-foreground: "#ffffff"   # text/icon on primary background
  primary-strong: "#1d4ed8"       # hover/active on primary, secondary-foreground
  primary-container: "#eff6ff"    # pale primary fill (chip, badge, soft hover)

  # Surfaces
  background: "#ffffff"           # default page background
  foreground: "#0f172a"           # primary text color (slate-900)
  card: "#ffffff"                 # card background
  card-foreground: "#0f172a"      # text on card
  popover: "#ffffff"              # popover/dropdown/modal background
  popover-foreground: "#0f172a"   # text on popover
  surface: "#f8fafc"              # secondary surface (section bg, sidebar)

  # Secondary / Muted
  secondary: "#f8fafc"            # secondary button background, secondary blocks
  secondary-foreground: "#1d4ed8" # text on secondary background (reuses primary-strong)
  muted: "#f8fafc"                # muted background (skeleton, disabled block)
  muted-foreground: "#64748b"     # secondary text, caption, meta (slate-500)
  ink-soft: "#334155"             # secondary strong text in Admin
  neutral-muted: "#94a3b8"        # faintest icon/label

  # Accent
  accent: "#b8f3f1"                # secondary accent fill (pale teal), light hover/highlight
  accent-foreground: "#1d4ed8"     # text on accent background
  teal: "#b8f3f1"                  # alias of accent — brand extra
  gold: "#f7c948"                  # rare secondary accent (e.g. rating, special highlight)
  gold-ink: "#5a4500"              # text on gold background
  accent-cyan: "#0e7490"           # extended accent for Admin/Staff
  accent-indigo: "#4338ca"         # extended accent for Admin/Staff
  accent-violet: "#6d28d9"         # extended accent for Admin/Staff

  # Membership tiers (Đồng / Bạc / Vàng / Bạch Kim / Kim Cương)
  tier-bronze: "#b07b4f"           # Đồng — badge/fill
  tier-bronze-ink: "#8c5a32"       # Đồng — text
  tier-silver: "#94a3b8"           # Bạc
  tier-silver-ink: "#64748b"       # Bạc — text
  tier-gold: "#f59e0b"             # Vàng
  tier-gold-ink: "#b8860b"         # Vàng — text
  tier-platinum: "#3b82f6"         # Bạch Kim
  tier-diamond: "#8b5cf6"          # Kim Cương

  # Borders
  border: "#e2e8f0"                # default border (slate-200)
  input: "#e2e8f0"                 # input border
  ring: "#2563eb"                  # focus ring — same as primary

  # Semantic / State — consistent across all 3 portals
  destructive: "#b91c1c"           # error, delete, cancel
  success: "#047857"               # success
  success-container: "#d1fae5"     # pale success background
  warning: "#b45309"               # warning
  warning-container: "#fef3c7"     # pale warning background
  critical: "#b91c1c"              # severe error (same as destructive, used separately in Admin)
  critical-container: "#fee2e2"    # pale critical background
  no-show: "#c2410c"               # customer no-show state (Admin/Staff)
  no-show-container: "#ffedd5"     # pale no-show background

  # Chart
  chart-1: "#2563eb"
  chart-2: "#f59e0b"
  chart-3: "#8b5cf6"
  chart-4: "#10b981"
  chart-5: "#64748b"

typography:
  # A single font for the whole system — no separate mono/serif face.
  sans:
    fontFamily: "Be Vietnam Pro, ui-sans-serif, system-ui, sans-serif"
  heading:
    fontFamily: "Be Vietnam Pro, ui-sans-serif, system-ui, sans-serif"   # = --font-sans, no separate heading face
  mono:
    fontFamily: "Be Vietnam Pro, ui-monospace, monospace"                 # named "mono" but still Be Vietnam Pro, not a real mono face

rounded:
  # Mapping SỬ DỤNG chốt theo code thực tế (Plan C):
  xl: "12px"    # button / input / select / control (rounded-xl)
  "2xl": "20px" # card / panel / modal (rounded-2xl) — bước mặc định
  "3xl": "24px" # hero / banner lớn — bước lớn duy nhất, cấm arbitrary rounded-[...]
  pill: "999px" # badge, chip, avatar (rounded-full)

shadow:
  # 3 token duy nhất — cấm shadow-[...] arbitrary. Khai báo trong @theme inline (index.css).
  card: "0 1px 3px rgba(15,23,42,0.06), 0 8px 24px -12px rgba(15,23,42,0.12)"   # bóng card mềm
  floating: "0 8px 32px rgba(15,23,42,0.18)"                                     # bar nổi / popover / modal
  cta: "0 4px 15px rgba(37,99,235,0.4)"  # nhấn CTA xanh — tên "cta" vì shadow-primary/NN đã dùng làm colored shadow

components:
  button-primary:
    backgroundColor: "{colors.primary}"
    textColor: "{colors.primary-foreground}"
    rounded: "{rounded.md}"
    padding: "10px 20px"
  button-primary-hover:
    backgroundColor: "{colors.primary-strong}"
    textColor: "{colors.primary-foreground}"
  button-secondary:
    backgroundColor: "{colors.secondary}"
    textColor: "{colors.secondary-foreground}"
    borderColor: "{colors.border}"
    rounded: "{rounded.md}"
    padding: "10px 20px"
  input-text:
    backgroundColor: "{colors.background}"
    textColor: "{colors.foreground}"
    borderColor: "{colors.input}"
    rounded: "{rounded.md}"
    padding: "10px 12px"
  card:
    backgroundColor: "{colors.card}"
    textColor: "{colors.card-foreground}"
    borderColor: "{colors.border}"
    rounded: "{rounded.lg}"
    padding: "24px"
  badge-success:
    backgroundColor: "{colors.success-container}"
    textColor: "{colors.success}"
    rounded: "{rounded.pill}"
  badge-warning:
    backgroundColor: "{colors.warning-container}"
    textColor: "{colors.warning}"
    rounded: "{rounded.pill}"
  badge-critical:
    backgroundColor: "{colors.critical-container}"
    textColor: "{colors.critical}"
    rounded: "{rounded.pill}"
  badge-no-show:
    backgroundColor: "{colors.no-show-container}"
    textColor: "{colors.no-show}"
    rounded: "{rounded.pill}"
---

# Design System: WashMate

## 1. Overview

WashMate is a laundry booking platform with 3 UI areas sharing one global token set: the **Customer Portal**, the **Staff Portal**, and the **Admin Portal**. All tokens (including semantic states, extended accents, and membership tiers) are declared once in `src/index.css` and apply to every portal — there are no per-portal scopes anymore.

**Key characteristics**

- Blue (`#2563eb`) is the primary brand color, used for every CTA, link, active state, and focus ring.
- Light mode only. There is no dark mode — `color-scheme: light` is fixed in `:root`.
- Large, consistent rounding: base radius `16px` (`--radius: 1rem`), buttons/inputs use `12px`.
- Crisp white background (`#ffffff`) with dark slate text (`#0f172a`) — never pure black, never neon.
- A single font: **Be Vietnam Pro** for all headings, body copy, and even the "mono" label (no real mono face, no serif).
- Semantic states (success/warning/critical/no-show) always pair a dark foreground color with a pale container background, kept consistent between Admin and Staff.

## 2. Source of Truth

- **`src/index.css`** — the ONLY source of tokens. Declares all base tokens in `:root` and maps them into Tailwind v4 utilities via the `@theme inline` block (`--color-success: var(--success)` → `bg-success`, `text-success`, ...). All three portals consume the same tokens.
- **`src/lib/chart-colors.js`** — the ONLY file in `src/` allowed to contain hex values besides `index.css`. It statically mirrors `--chart-*` plus a few chart helpers (grid, axis, tooltip ink) because Recharts needs concrete color strings, and exports `STATUS_COLORS` for booking-status charts. Keep it in sync with `--chart-*` in `index.css`.

The former `src/styles/design-tokens.css` (`.wm-admin`/`.wm-staff` scoped `--adm-*` tokens + Tailwind palette bridge) and `src/styles/theme.css` (font import + legacy `--brand-*` vars) have been **removed** — the migration they bridged is complete. When changing a color, edit `src/index.css`, cross-check `src/lib/chart-colors.js`, and update this file.

### Long-term rules (enforced by grep gates)

All of these must return **0** matches at all times:

```
rg -n "#[0-9a-fA-F]{3,8}\b" src --glob "*.jsx"                      # no hex in JSX (chart-colors.js is a .js file and the only allowed hex source)
rg -n "dark:" src/components/ui                                      # light-only system
rg -n "\[#" src --glob "*.jsx"                                       # no arbitrary hex classes
rg -n "(bg|text|border|ring|divide|from|to|via|fill|shadow)-(slate|gray|emerald|green|amber|yellow|red|rose|orange|blue|sky|cyan|indigo|violet|purple|teal|pink|fuchsia)-[0-9]" src   # no raw Tailwind palette — use tokens
rg -n "design-tokens.css|styles/theme.css" src                       # deleted files must stay deleted
rg -n "bg-white" src --glob "*.jsx"                                  # surface qua token: bg-card / bg-background
rg -n "shadow-\[" src --glob "*.jsx"                                 # chỉ shadow-card / shadow-floating / shadow-cta
rg -n "shadow-(md|lg|xl|2xl)\b|drop-shadow" src --glob "*.jsx"       # shadow qua 3 token, không dùng scale Tailwind (shadow-sm đang dọn dần)
rg -n "rounded-\[" src --glob "*.jsx" -g "!src/components/ui/**"     # radius theo scale, không arbitrary
rg -n "text-\[[0-9.]+(px|rem)\]" src --glob "*.jsx"                  # type theo ramp 5 bậc, không arbitrary px/rem
rg -n "SparkleAI|AutoWash" src                                        # brand duy nhất: WashMate
rg -n "tracking-\[0\.1[0-9]em\]" src --glob "*.jsx"                  # eyebrow duy nhất tracking-[0.2em]
rg -n "uppercase" src --glob "*.jsx" -g "!**/PageHeader.jsx"         # uppercase chỉ ở eyebrow PageHeader (ngoại lệ: input value như mã ưu đãi)
rg -n "dicebear|Nguyễn Văn A" src -g "!**/RegisterPage.jsx"          # danh tính thật từ session, không avatar/tên giả (placeholder form OK)
rg -n "[🔍👋🚨📞🏅✨]" src                                            # không emoji trang trí trong UI — dùng icon lucide
rg -n "\balert\(|window\.confirm\(" src -g "!**/ConfirmDialog.jsx"   # feedback qua toast/confirmDialog
rg -n "common/StatusBadge|BookingStatusBadge" src                    # 1 StatusBadge duy nhất (shared/)
rg -n "toggle-mobile-menu" src                                       # không dùng CustomEvent cho UI state
```

## 3. Colors

### Brand

- **Primary** (`#2563eb`): CTAs, links, active state, focus ring (`ring`). This is the single color that represents the brand — no second color competes for this role.
- **Primary Strong** (`#1d4ed8`): hover/active on primary, text on secondary background.
- **Primary Container** (`#eff6ff`): very pale blue fill for chips/badges related to primary.

### Surfaces

- **Background** (`#ffffff`): default page background across every area.
- **Foreground** (`#0f172a`): primary text color on light backgrounds.
- **Card / Popover** (`#ffffff`): same background color, differentiated by border (`border`) and a subtle shadow rather than a different fill.
- **Surface** (`#f8fafc`): secondary surface for sections, sidebars, neutral blocks.

### Secondary and Neutral

- **Secondary** (`#f8fafc` bg / `#1d4ed8` text): secondary buttons, secondary blocks — near-white background, text still carries the brand hue.
- **Muted** (`#f8fafc` bg / `#64748b` text): descriptive text, captions, disabled state.
- **Ink Soft** (`#334155`) and **Neutral Muted** (`#94a3b8`): two supporting gray levels used in Admin for text hierarchy.

### Accent

- **Accent / Teal** (`#b8f3f1`): pale mint used for light hover or secondary highlighting — not the brand color, used sparingly.
- **Gold** (`#f7c948`): rare accent for special details (rating, special highlight) — never used as a large fill.
- **Accent Cyan/Indigo/Violet** (`#0e7490` / `#4338ca` / `#6d28d9`): reserved for Admin/Staff when multiple data groups need distinct categorization (e.g. charts, category tags).

### Semantic (State)

Each state pairs a "dark text/icon color" with a "pale container background":

- **Success**: `#047857` on `#d1fae5` — completed, successful.
- **Warning**: `#b45309` on `#fef3c7` — needs attention, pending.
- **Critical / Destructive**: `#b91c1c` on `#fee2e2` — error, delete, cancel.
- **No-show**: `#c2410c` on `#ffedd5` — customer did not show up (booking-domain-specific state).

### Chart

`chart-1` through `chart-5` (`#2563eb`, `#f59e0b`, `#8b5cf6`, `#10b981`, `#64748b`) are used for statistical charts in Admin — up to 5 series per chart, and they should not be reused for semantic-state colors within the same chart to avoid implying a status that isn't there.

### Color Rules

**Primary Carries The Brand.** If only one color can represent WashMate, it's blue `#2563eb`, not teal or gold.

**Semantic Colors Are Not Decoration.** success/warning/critical/no-show must only be used for their exact matching business state, never as random decoration.

**Do Not Improvise New Colors.** Don't add a new hex value outside the table above when building UI. If a token is missing, add it to `src/index.css`/`design-tokens.css` first, then update this file — never hard-code a stray color inside a component.

**Light-Only.** There is no dark mode. Don't write CSS assuming a `.dark` class or `prefers-color-scheme: dark` for these tokens.

## 4. Typography

**Single font:** Be Vietnam Pro, ui-sans-serif, system-ui, sans-serif — used for headings, body text, and even the token named "mono" (there is no real mono face in this system).

**Type ramp (5 bậc — chốt Plan C):**

| Vai trò | Class | Ghi chú |
|---|---|---|
| Page title | `text-2xl sm:text-3xl font-extrabold` | CHỈ qua `PageHeader` — không tự viết `h1` trong page |
| Section title | `text-lg font-bold` | heading trong card/section |
| KPI number | `text-2xl font-extrabold` | số liệu lớn trên stat tile |
| Body | `text-sm` | mặc định |
| Caption / table meta | `text-xs font-medium` (nhấn: `font-bold`) | **cỡ nhỏ nhất của hệ thống** |

- **Cấm cỡ arbitrary** `text-[10px]`, `text-[11px]`, `text-[13px]`… — nhỏ nhất là `text-xs` (12px).
- **Eyebrow label** duy nhất một kiểu: `text-xs font-bold uppercase tracking-[0.2em] text-primary` (nằm sẵn trong `PageHeader`). Không dùng tracking khác (`0.16em`/`0.18em`/`widest`).
- **Icon (lucide)** 4 mức: 14 (inline text/badge), 16 (button), 18 (nav/header), 20 (feature/tile).

## 5. Rounded Corners & Shadows

Mapping sử dụng (chuẩn hóa theo code thực tế — Plan C):

- `rounded-xl` (12px) — button, input, select, control
- `rounded-2xl` (20px) — card, panel, modal — **bước mặc định**
- `rounded-3xl` — hero/banner lớn, bước lớn duy nhất
- `rounded-full` — badge, chip, avatar
- **Cấm** `rounded-[…]` arbitrary (`[2rem]`, `[4px]`…) ngoài `src/components/ui/`.

Shadow — chỉ 3 utility từ token (khai báo `@theme inline` trong `index.css`):

- `shadow-card` — bóng card mềm (thường không cần: card phân tách bằng border trước).
- `shadow-floating` — bar nổi, dropdown, modal.
- `shadow-cta` — nhấn CTA xanh (tên "cta" vì `shadow-primary/NN` đã được dùng làm colored shadow).
- **Cấm** `shadow-[…]` arbitrary.

Don't use square corners (`rounded-none`) on cards or primary buttons — WashMate's UI is always rounded.

## 6. Components

- **Button** (`src/components/ui/button.jsx`, Base UI): nút hành động DUY NHẤT cho cả 3 portal — mọi CTA/nút form/dialog dùng primitive này, không tự viết `<button>` styled. Base: `rounded-xl`, `text-sm font-bold`, icon svg mặc định 16px. Variants: `default` (bg-primary, hover `primary-strong`) / `outline` / `secondary` / `ghost` / `destructive` (đỏ nhạt) / `link`. Sizes: `sm` h-9 · `default` h-10 · `lg` h-11 · `xl` h-12 · `icon` / `icon-sm`. Link kiểu nút: `<Button render={<Link to=... />}>`. Ngoại lệ không migrate: tab pill, filter chip có selected-state, pagination, toggle, nav link.
- **Input**: `background` fill, `input` border, `xl` rounding.
- **Card**: `card` fill (`bg-card`, KHÔNG `bg-white`), `border` outline, `2xl` rounding, no heavy shadow — differentiate with a thin border first; only `shadow-card`/`shadow-floating` when a surface truly floats.
- **StatusBadge** (`src/components/shared/StatusBadge.jsx`): badge trạng thái booking/payment DUY NHẤT cho cả 3 portal — tone + label lấy từ `src/lib/status-tones.js`, size `sm` (bảng) / `md` (card). Không tự chế tone map trạng thái mới.
- **PageHeader** (`src/components/shared/PageHeader.jsx`): header chuẩn mọi page (eyebrow + h1 + description + actions) — nơi duy nhất định nghĩa cỡ page-title.
- **PageContainer** (`src/components/shared/PageContainer.jsx`): khung page — `admin` (Admin+Staff, `max-w-[1600px]`), `customer` (`max-w-7xl`), `narrow` (`max-w-5xl`); padding `p-4 sm:p-6 lg:p-8`, nhịp dọc `space-y-6`.
- **EmptyState** (`src/components/shared/EmptyState.jsx`): trạng thái rỗng chuẩn (icon + title + description + action) — không tự viết "Chưa có dữ liệu…" trần.
- **PortalShell** (`src/components/shared/PortalShell.jsx`): khung dark-sidebar + drawer mobile dùng chung cho Admin + Staff layout.
- **Toast / ConfirmDialog**: mọi feedback thao tác qua `toast` (`ui/toast.jsx`) và `confirmDialog()` (`shared/ConfirmDialog.jsx`) — cấm `alert()`/`window.confirm()`.

## 7. Do and Do Not

### Do

- Use `#2563eb` (primary) as the CTA and active-state color across all 3 portals.
- Use the correct container/text pairing for each semantic state (success/warning/critical/no-show).
- Keep backgrounds white, rounding generous (`12px`+ for buttons/cards), and borders thin (`#e2e8f0`) to separate blocks.
- Use Be Vietnam Pro for all text — don't mix in another font.
- When any portal needs a new color token, declare it in `src/index.css` (`:root` + `@theme inline` mirror), then document it here — never override a color directly in a component.

### Do Not

- Do not use random accents (gold, teal, cyan, indigo, violet, ...) as a large background or primary CTA color — these are secondary accents only, used sparingly.
- Do not add dark mode or a dark theme for these tokens.
- Do not hard-code a new hex value in a component when an equivalent token already exists.
- Do not use a semantic color (success/warning/critical/no-show) outside its exact matching state.
- Do not introduce a second font — the whole system uses only Be Vietnam Pro.
