import { useMemo, useState } from "react";

/* =========================================================
 * MOCK DATA  (giữ nguyên — sẽ thay bằng API thật khi BE chốt)
 * =======================================================*/
const initialLoyaltyAccount = {
  accountId: 1,
  customerName: "Nguyễn Văn A",
  garageName: "AutoWash Garage Thủ Đức",
  tierName: "Silver",
  status: "ACTIVE",
  totalPoints: 245,
  availablePoints: 185,
  totalSpending: 2450000,
  joinedAt: "2026-01-15",
  lastActivityAt: "2026-06-06",
  nextTierName: "Gold",
  nextTierMinPoints: 500,
};

const mockTransactions = [
  {
    id: 1,
    type: "EARN",
    points: 11,
    bookingCode: "BK-0001",
    description: "Cộng điểm từ booking đã COMPLETED và payment PAID",
    createdAt: "06/06/2026 10:20",
  },
  {
    id: 2,
    type: "REDEEM",
    points: -50,
    bookingCode: null,
    description: "Đổi voucher giảm giá 50.000đ",
    createdAt: "20/05/2026 09:15",
  },
  {
    id: 3,
    type: "EARN",
    points: 12,
    bookingCode: "BK-0008",
    description: "Cộng điểm từ dịch vụ Premium Wash",
    createdAt: "18/05/2026 14:30",
  },
  {
    id: 4,
    type: "ROLLBACK",
    points: -8,
    bookingCode: "BK-0005",
    description: "Hoàn tác điểm do payment được refund",
    createdAt: "02/05/2026 16:40",
  },
];

const initialRewards = [
  {
    id: 1,
    name: "Voucher giảm 50.000đ",
    description: "Áp dụng cho lần rửa xe tiếp theo tại cùng garage.",
    pointsRequired: 50,
    stock: 20,
    status: "ACTIVE",
  },
  {
    id: 2,
    name: "Nâng cấp Premium Wash",
    description: "Nâng cấp từ Basic Wash lên Premium Wash.",
    pointsRequired: 150,
    stock: 8,
    status: "ACTIVE",
  },
  {
    id: 3,
    name: "Voucher giảm 150.000đ",
    description: "Dành cho khách hàng thân thiết hạng Silver trở lên.",
    pointsRequired: 250,
    stock: 5,
    status: "ACTIVE",
  },
  {
    id: 4,
    name: "Gói Full Detailing",
    description: "Ưu đãi số lượng giới hạn cho thành viên tích điểm cao.",
    pointsRequired: 500,
    stock: 0,
    status: "OUT_OF_STOCK",
  },
];

/* =========================================================
 * HELPERS
 * =======================================================*/
function formatCurrency(value) {
  return new Intl.NumberFormat("vi-VN", {
    style: "currency",
    currency: "VND",
  }).format(value);
}

function getStatusLabel(status) {
  const labels = { ACTIVE: "Đang hoạt động", OUT_OF_STOCK: "Hết quà" };
  return labels[status] || status;
}

function getTransactionTypeLabel(type) {
  const labels = {
    EARN: "Cộng điểm",
    REDEEM: "Đổi điểm",
    ROLLBACK: "Hoàn tác",
  };
  return labels[type] || type;
}

// Màu badge hạng đổi theo tier
function getTierTheme(tierName) {
  const map = {
    BRONZE: { chip: "from-orange-400 to-amber-500", text: "text-amber-600" },
    SILVER: { chip: "from-slate-400 to-slate-600", text: "text-slate-600" },
    GOLD: { chip: "from-amber-400 to-yellow-500", text: "text-amber-600" },
    PLATINUM: {
      chip: "from-indigo-400 to-violet-500",
      text: "text-violet-600",
    },
  };
  return map[(tierName || "").toUpperCase()] || map.SILVER;
}

/* =========================================================
 * ICONS (SVG inline — không cần thư viện ngoài)
 * =======================================================*/
function Icon({ path, className = "h-5 w-5" }) {
  return (
    <svg
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
      className={className}
    >
      {path}
    </svg>
  );
}

const CrownIcon = (p) => (
  <Icon {...p} path={<path d="M3 17h18M5 17l-2-9 5 4 4-7 4 7 5-4-2 9" />} />
);
const WalletIcon = (p) => (
  <Icon
    {...p}
    path={
      <>
        <path d="M3 7h15a2 2 0 0 1 2 2v8a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V7z" />
        <path d="M3 7l13-3v3M16 13h.01" />
      </>
    }
  />
);
const SparkIcon = (p) => (
  <Icon
    {...p}
    path={
      <path d="M12 3l1.8 5.2L19 10l-5.2 1.8L12 17l-1.8-5.2L5 10l5.2-1.8L12 3z" />
    }
  />
);
const TrendIcon = (p) => (
  <Icon {...p} path={<path d="M3 17l6-6 4 4 7-7M14 8h7v7" />} />
);
const ShieldIcon = (p) => (
  <Icon
    {...p}
    path={
      <path d="M12 3l8 3v6c0 5-3.4 7.5-8 9-4.6-1.5-8-4-8-9V6l8-3zM9 12l2 2 4-4" />
    }
  />
);
const GiftIcon = (p) => (
  <Icon
    {...p}
    path={
      <>
        <path d="M20 12v9H4v-9M2 7h20v5H2zM12 22V7" />
        <path d="M12 7H7.5a2.5 2.5 0 1 1 0-5C11 2 12 7 12 7zM12 7h4.5a2.5 2.5 0 1 0 0-5C13 2 12 7 12 7z" />
      </>
    }
  />
);
const PlusIcon = (p) => <Icon {...p} path={<path d="M12 5v14M5 12h14" />} />;
const MinusIcon = (p) => <Icon {...p} path={<path d="M5 12h14" />} />;
const RotateIcon = (p) => (
  <Icon {...p} path={<path d="M3 12a9 9 0 1 0 3-6.7L3 8m0-5v5h5" />} />
);

function getTransactionIcon(type) {
  if (type === "EARN") return PlusIcon;
  if (type === "REDEEM") return MinusIcon;
  return RotateIcon;
}

/* =========================================================
 * UI PRIMITIVES
 * =======================================================*/
function StatusBadge({ status }) {
  const style =
    status === "ACTIVE"
      ? "border-emerald-200 bg-emerald-50 text-emerald-700"
      : "border-rose-200 bg-rose-50 text-rose-600";
  return (
    <span
      className={`inline-flex items-center gap-1.5 rounded-full border px-3 py-1 text-xs font-semibold ${style}`}
    >
      <span
        className={`h-1.5 w-1.5 rounded-full ${
          status === "ACTIVE" ? "bg-emerald-500" : "bg-rose-400"
        }`}
      />
      {getStatusLabel(status)}
    </span>
  );
}

function TransactionBadge({ type }) {
  const style =
    type === "EARN"
      ? "border-emerald-200 bg-emerald-50 text-emerald-700"
      : type === "REDEEM"
        ? "border-amber-200 bg-amber-50 text-amber-700"
        : "border-rose-200 bg-rose-50 text-rose-600";
  return (
    <span
      className={`inline-flex items-center rounded-full border px-2.5 py-0.5 text-xs font-semibold ${style}`}
    >
      {getTransactionTypeLabel(type)}
    </span>
  );
}

function StatCard({ icon: IconCmp, label, value, hint, tone }) {
  const toneMap = {
    emerald: { ring: "bg-emerald-100 text-emerald-600", bar: "bg-emerald-500" },
    sky: { ring: "bg-sky-100 text-sky-600", bar: "bg-sky-500" },
    violet: { ring: "bg-violet-100 text-violet-600", bar: "bg-violet-500" },
    amber: { ring: "bg-amber-100 text-amber-600", bar: "bg-amber-500" },
  };
  const t = toneMap[tone] || toneMap.emerald;
  return (
    <div className="group relative overflow-hidden rounded-2xl border border-slate-200 bg-white p-5 shadow-sm transition hover:-translate-y-0.5 hover:shadow-md">
      <span className={`absolute inset-x-0 top-0 h-1 ${t.bar}`} />
      <div
        className={`flex h-11 w-11 items-center justify-center rounded-xl ${t.ring}`}
      >
        <IconCmp className="h-5 w-5" />
      </div>
      <p className="mt-4 text-sm font-medium text-slate-500">{label}</p>
      <p className="mt-1 text-2xl font-bold tracking-tight text-slate-900">
        {value}
      </p>
      <p className="mt-1 text-xs leading-5 text-slate-400">{hint}</p>
    </div>
  );
}

/* =========================================================
 * PAGE
 * =======================================================*/
function LoyaltyPage() {
  const [account, setAccount] = useState(initialLoyaltyAccount);
  const [rewards, setRewards] = useState(initialRewards);
  const [selectedFilter, setSelectedFilter] = useState("ALL");
  const [redemptionMessage, setRedemptionMessage] = useState("");

  const tierTheme = getTierTheme(account.tierName);

  const progressPercent = Math.min(
    Math.round((account.totalPoints / account.nextTierMinPoints) * 100),
    100,
  );
  const pointsToNextTier = Math.max(
    account.nextTierMinPoints - account.totalPoints,
    0,
  );

  const filteredTransactions = useMemo(() => {
    if (selectedFilter === "ALL") return mockTransactions;
    return mockTransactions.filter((tx) => tx.type === selectedFilter);
  }, [selectedFilter]);

  function handleRedeemReward(reward) {
    if (reward.status !== "ACTIVE" || reward.stock <= 0) {
      setRedemptionMessage("Reward hiện không khả dụng hoặc đã hết số lượng.");
      return;
    }
    if (account.availablePoints < reward.pointsRequired) {
      setRedemptionMessage("Không đủ điểm khả dụng để đổi reward này.");
      return;
    }
    setAccount((current) => ({
      ...current,
      availablePoints: current.availablePoints - reward.pointsRequired,
      lastActivityAt: new Date().toLocaleDateString("vi-VN"),
    }));
    setRewards((current) =>
      current.map((item) => {
        if (item.id !== reward.id) return item;
        const nextStock = item.stock - 1;
        return {
          ...item,
          stock: nextStock,
          status: nextStock <= 0 ? "OUT_OF_STOCK" : item.status,
        };
      }),
    );
    setRedemptionMessage(`Đổi "${reward.name}" thành công trong mock UI.`);
  }

  return (
    <div className="w-full space-y-6 pb-12">
      {/* ============ HERO ============ */}
      <section className="relative overflow-hidden rounded-3xl bg-gradient-to-br from-teal-500 via-emerald-500 to-cyan-600 p-6 shadow-lg shadow-emerald-500/20 md:p-8">
        <div className="pointer-events-none absolute -right-16 -top-16 h-56 w-56 rounded-full bg-white/15 blur-2xl" />
        <div className="pointer-events-none absolute -bottom-20 left-1/3 h-48 w-48 rounded-full bg-cyan-300/20 blur-2xl" />

        <div className="relative grid gap-7 lg:grid-cols-[1.3fr_1fr] lg:items-center">
          {/* Left */}
          <div className="text-white">
            <span className="inline-flex items-center gap-2 rounded-full bg-white/15 px-3 py-1 text-xs font-semibold uppercase tracking-wider text-white ring-1 ring-white/25 backdrop-blur">
              <SparkIcon className="h-3.5 w-3.5" />
              Loyalty Program
            </span>

            <h1 className="mt-4 text-3xl font-bold leading-tight tracking-tight md:text-4xl">
              Quản lý điểm thưởng & hạng thành viên
            </h1>

            <p className="mt-3 max-w-xl text-sm leading-6 text-white/85">
              Theo dõi điểm khả dụng, tiến độ lên hạng, lịch sử giao dịch và
              reward có thể đổi theo từng garage.
            </p>

            <div className="mt-5 flex flex-wrap items-center gap-2 text-xs font-medium">
              {["Booking COMPLETED", "Payment PAID", "Loyalty earned"].map(
                (chip, i) => (
                  <span key={chip} className="inline-flex items-center gap-1.5">
                    {i > 0 && <span className="text-white/50">→</span>}
                    <span className="rounded-lg bg-white/15 px-3 py-1.5 text-white ring-1 ring-white/20">
                      {chip}
                    </span>
                  </span>
                ),
              )}
            </div>
          </div>

          {/* Right — membership card */}
          <div className="rounded-2xl border border-white/25 bg-white/10 p-5 backdrop-blur-md">
            <div className="flex items-start justify-between gap-3">
              <div>
                <p className="text-xs font-medium text-white/70">
                  Tài khoản khách hàng
                </p>
                <p className="mt-1 text-xl font-bold text-white">
                  {account.customerName}
                </p>
                <p className="mt-0.5 text-sm text-white/75">
                  {account.garageName}
                </p>
              </div>
              <StatusBadge status={account.status} />
            </div>

            <div className="mt-5 grid grid-cols-2 gap-3">
              <div className="rounded-xl bg-white/15 p-4 ring-1 ring-white/15">
                <p className="text-xs text-white/70">Hạng hiện tại</p>
                <div className="mt-2 flex items-center gap-2">
                  <span
                    className={`flex h-7 w-7 items-center justify-center rounded-lg bg-gradient-to-br ${tierTheme.chip} text-white shadow-sm`}
                  >
                    <CrownIcon className="h-4 w-4" />
                  </span>
                  <span className="text-xl font-bold text-white">
                    {account.tierName}
                  </span>
                </div>
              </div>

              <div className="rounded-xl bg-white/15 p-4 ring-1 ring-white/15">
                <p className="text-xs text-white/70">Điểm khả dụng</p>
                <p className="mt-2 text-2xl font-bold text-white">
                  {account.availablePoints}
                </p>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* ============ RULE NOTE ============ */}
      <section className="flex items-start gap-3 rounded-2xl border border-emerald-200 bg-emerald-50/70 p-4">
        <span className="flex h-9 w-9 shrink-0 items-center justify-center rounded-xl bg-gradient-to-br from-emerald-500 to-teal-500 text-white shadow-sm">
          <ShieldIcon className="h-5 w-5" />
        </span>
        <p className="text-sm leading-6 text-emerald-900">
          <span className="font-semibold">Quy tắc nghiệp vụ: </span>
          Loyalty point chỉ được cộng khi Booking <b>COMPLETED</b> và Payment{" "}
          <b>PAID</b>. Nếu payment <b>REFUNDED</b>, hệ thống phải rollback hoặc
          adjustment điểm.
        </p>
      </section>

      {/* ============ STATS ============ */}
      <section className="grid grid-cols-1 gap-4 sm:grid-cols-2 xl:grid-cols-4">
        <StatCard
          icon={WalletIcon}
          label="Điểm khả dụng"
          value={account.availablePoints}
          hint="Có thể dùng để đổi reward"
          tone="emerald"
        />
        <StatCard
          icon={SparkIcon}
          label="Tổng điểm tích lũy"
          value={account.totalPoints}
          hint="Dùng để xét hạng thành viên"
          tone="sky"
        />
        <StatCard
          icon={CrownIcon}
          label="Hạng hiện tại"
          value={account.tierName}
          hint={`Mục tiêu tiếp theo: ${account.nextTierName}`}
          tone="violet"
        />
        <StatCard
          icon={TrendIcon}
          label="Tổng chi tiêu"
          value={formatCurrency(account.totalSpending)}
          hint="Tổng giá trị dịch vụ đã sử dụng"
          tone="amber"
        />
      </section>

      {/* ============ PROGRESS + ACCOUNT INFO ============ */}
      <section className="grid grid-cols-1 gap-4 lg:grid-cols-[1.4fr_1fr]">
        {/* Progress */}
        <div className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm">
          <div className="flex items-start justify-between gap-4">
            <div>
              <p className="text-xs font-semibold uppercase tracking-wider text-slate-400">
                Loyalty Account #{account.accountId}
              </p>
              <h2 className="mt-1.5 text-xl font-bold tracking-tight text-slate-900">
                Tiến độ lên hạng {account.nextTierName}
              </h2>
              <p className="mt-1 text-sm leading-6 text-slate-500">
                Cần thêm{" "}
                <span className="font-semibold text-slate-900">
                  {pointsToNextTier}
                </span>{" "}
                điểm để đạt hạng tiếp theo.
              </p>
            </div>
            <div className="rounded-2xl bg-gradient-to-br from-emerald-500 to-teal-600 px-4 py-3 text-center text-white shadow-sm shadow-emerald-500/30">
              <p className="text-[11px] font-medium text-white/80">
                Hoàn thành
              </p>
              <p className="text-2xl font-bold leading-none">
                {progressPercent}%
              </p>
            </div>
          </div>

          <div className="mt-6">
            <div className="mb-2 flex items-center justify-between text-xs font-semibold text-slate-500">
              <span>{account.tierName}</span>
              <span>{account.nextTierName}</span>
            </div>
            <div className="h-3 w-full overflow-hidden rounded-full bg-slate-100">
              <div
                className="h-full rounded-full bg-gradient-to-r from-emerald-500 via-teal-500 to-cyan-500 transition-all duration-700"
                style={{ width: `${progressPercent}%` }}
              />
            </div>

            <div className="mt-4 grid grid-cols-3 gap-3 text-center">
              {[
                { k: "Hiện có", v: account.totalPoints },
                {
                  k: `Mốc ${account.nextTierName}`,
                  v: account.nextTierMinPoints,
                },
                { k: "Còn thiếu", v: pointsToNextTier },
              ].map((b) => (
                <div key={b.k} className="rounded-xl bg-slate-50 p-3">
                  <p className="text-xs text-slate-500">{b.k}</p>
                  <p className="mt-1 text-lg font-bold text-slate-900">{b.v}</p>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Account info */}
        <div className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm">
          <div className="flex items-center justify-between gap-3">
            <div>
              <p className="text-xs font-semibold uppercase tracking-wider text-slate-400">
                Account Info
              </p>
              <h2 className="mt-1.5 text-xl font-bold tracking-tight text-slate-900">
                Thông tin tài khoản
              </h2>
            </div>
            <StatusBadge status={account.status} />
          </div>

          <div className="mt-5 space-y-3 text-sm">
            <div className="rounded-xl bg-slate-50 p-4">
              <p className="text-slate-500">Garage</p>
              <p className="mt-1 font-semibold leading-6 text-slate-900">
                {account.garageName}
              </p>
            </div>
            <div className="grid grid-cols-2 gap-3">
              <div className="rounded-xl bg-slate-50 p-4">
                <p className="text-slate-500">Ngày tham gia</p>
                <p className="mt-1 font-semibold text-slate-900">
                  {account.joinedAt}
                </p>
              </div>
              <div className="rounded-xl bg-slate-50 p-4">
                <p className="text-slate-500">Hoạt động cuối</p>
                <p className="mt-1 font-semibold text-slate-900">
                  {account.lastActivityAt}
                </p>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* ============ TRANSACTION HISTORY ============ */}
      <section className="overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-sm">
        <div className="flex flex-col gap-3 border-b border-slate-100 p-6 md:flex-row md:items-center md:justify-between">
          <div>
            <p className="text-xs font-semibold uppercase tracking-wider text-slate-400">
              Point History
            </p>
            <h2 className="mt-1.5 text-xl font-bold tracking-tight text-slate-900">
              Lịch sử giao dịch điểm
            </h2>
            <p className="mt-1 text-sm text-slate-500">
              Mọi thay đổi điểm đều được ghi nhận để phục vụ audit và đối soát.
            </p>
          </div>
          <select
            value={selectedFilter}
            onChange={(e) => setSelectedFilter(e.target.value)}
            className="h-10 rounded-xl border border-slate-200 bg-white px-3 text-sm font-medium text-slate-700 outline-none transition focus:border-emerald-500 focus:ring-2 focus:ring-emerald-100"
          >
            <option value="ALL">Tất cả giao dịch</option>
            <option value="EARN">Cộng điểm</option>
            <option value="REDEEM">Đổi điểm</option>
            <option value="ROLLBACK">Hoàn tác</option>
          </select>
        </div>

        <div className="divide-y divide-slate-100">
          {filteredTransactions.length === 0 && (
            <div className="p-8 text-center text-sm text-slate-400">
              Không có giao dịch nào phù hợp bộ lọc.
            </div>
          )}
          {filteredTransactions.map((tx) => {
            const TxIcon = getTransactionIcon(tx.type);
            const positive = tx.points >= 0;
            return (
              <div
                key={tx.id}
                className="flex items-center gap-4 p-4 transition hover:bg-slate-50 md:p-5"
              >
                <div
                  className={`flex h-10 w-10 shrink-0 items-center justify-center rounded-xl ${
                    positive
                      ? "bg-emerald-50 text-emerald-600"
                      : "bg-rose-50 text-rose-500"
                  }`}
                >
                  <TxIcon className="h-5 w-5" />
                </div>

                <div className="min-w-0 flex-1">
                  <div className="flex flex-wrap items-center gap-2">
                    <TransactionBadge type={tx.type} />
                    {tx.bookingCode && (
                      <span className="rounded-md bg-slate-100 px-2 py-0.5 text-xs font-semibold text-slate-600">
                        {tx.bookingCode}
                      </span>
                    )}
                  </div>
                  <p className="mt-1.5 truncate text-sm font-semibold text-slate-900">
                    {tx.description}
                  </p>
                  <p className="mt-0.5 text-xs text-slate-400">
                    {tx.createdAt}
                  </p>
                </div>

                <p
                  className={`shrink-0 text-xl font-bold ${
                    positive ? "text-emerald-600" : "text-rose-500"
                  }`}
                >
                  {positive ? "+" : ""}
                  {tx.points}
                </p>
              </div>
            );
          })}
        </div>
      </section>

      {/* ============ REWARD STORE ============ */}
      <section className="space-y-4">
        <div className="flex flex-col gap-3 md:flex-row md:items-end md:justify-between">
          <div>
            <p className="text-xs font-semibold uppercase tracking-wider text-slate-400">
              Reward Store
            </p>
            <h2 className="mt-1.5 text-xl font-bold tracking-tight text-slate-900">
              Reward có thể đổi
            </h2>
            <p className="mt-1 text-sm leading-6 text-slate-500">
              Reward được cung cấp theo từng garage và sẽ trừ điểm khi đổi thành
              công.
            </p>
          </div>
          {redemptionMessage && (
            <div className="rounded-xl border border-sky-200 bg-sky-50 px-4 py-2.5 text-sm font-medium text-sky-800">
              {redemptionMessage}
            </div>
          )}
        </div>

        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 xl:grid-cols-4">
          {rewards.map((reward) => {
            const canRedeem =
              reward.status === "ACTIVE" &&
              reward.stock > 0 &&
              account.availablePoints >= reward.pointsRequired;
            const notEnoughPoint =
              reward.status === "ACTIVE" &&
              reward.stock > 0 &&
              account.availablePoints < reward.pointsRequired;

            return (
              <div
                key={reward.id}
                className="flex flex-col rounded-2xl border border-slate-200 bg-white p-5 shadow-sm transition hover:-translate-y-1 hover:shadow-md"
              >
                <div className="flex items-start justify-between gap-3">
                  <span className="flex h-11 w-11 items-center justify-center rounded-xl bg-gradient-to-br from-emerald-500 to-cyan-500 text-white shadow-sm">
                    <GiftIcon className="h-5 w-5" />
                  </span>
                  <StatusBadge status={reward.status} />
                </div>

                <h3 className="mt-4 text-base font-bold leading-6 tracking-tight text-slate-900">
                  {reward.name}
                </h3>
                <p className="mt-1.5 flex-1 text-sm leading-6 text-slate-500">
                  {reward.description}
                </p>

                <div className="mt-4 space-y-2 rounded-xl bg-slate-50 p-3 text-sm">
                  <div className="flex items-center justify-between">
                    <span className="text-slate-500">Điểm cần dùng</span>
                    <span className="font-bold text-slate-900">
                      {reward.pointsRequired}
                    </span>
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="text-slate-500">Số lượng còn lại</span>
                    <span
                      className={`font-bold ${
                        reward.stock > 0 ? "text-slate-900" : "text-rose-500"
                      }`}
                    >
                      {reward.stock}
                    </span>
                  </div>
                </div>

                <button
                  type="button"
                  onClick={() => handleRedeemReward(reward)}
                  disabled={!canRedeem}
                  className="mt-4 h-11 rounded-xl bg-slate-900 px-4 text-sm font-semibold text-white transition hover:bg-emerald-600 disabled:cursor-not-allowed disabled:bg-slate-100 disabled:text-slate-400"
                >
                  {reward.status === "OUT_OF_STOCK"
                    ? "Hết số lượng"
                    : canRedeem
                      ? "Đổi reward"
                      : "Chưa đủ điểm"}
                </button>

                {notEnoughPoint && (
                  <p className="mt-2 text-center text-xs font-medium text-rose-500">
                    Cần thêm {reward.pointsRequired - account.availablePoints}{" "}
                    điểm để đổi reward này.
                  </p>
                )}
              </div>
            );
          })}
        </div>
      </section>
    </div>
  );
}

export default LoyaltyPage;
