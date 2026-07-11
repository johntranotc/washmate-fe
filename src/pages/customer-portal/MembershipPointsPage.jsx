import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import {
  AlertTriangle,
  BadgePercent,
  Clock,
  Crown,
  Gift,
  History,
  RotateCcw,
  Sparkles,
  Store,
  Trophy,
} from "lucide-react";
import PageContainer from "@/components/shared/PageContainer";
import PageHeader from "@/components/shared/PageHeader";
import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";
import { KpiCard } from "@/components/shared/KpiCard";
import { EmptyState } from "@/components/shared/EmptyState";
import { toast } from "@/components/ui/toast";
import { RedeemRewardDialog } from "@/components/customer-portal/redeem-reward-dialog";
import { TierDetailDrawer } from "@/components/customer-portal/tier-detail-drawer";
import { TierBadge, tierLabel, tierTheme } from "@/components/customer-portal/tier-badge";
import { loyaltyApi } from "@/api/loyaltyApi";
import { rewardApi } from "@/api/rewardApi";
import { friendlyError } from "@/lib/api-error";
import { formatBookingDate } from "@/lib/customer-booking-data";
import { getStoredGarageId, storeGarageId } from "@/lib/loyalty-garage-selection";
import {
  computeTierProgress,
  normalizeLoyaltyAccount,
  normalizeLoyaltyTransactions,
  normalizePolicy,
  normalizeRewards,
  normalizeTiers,
  rewardState,
} from "@/lib/customer-loyalty-data";

const fmt = (n) => new Intl.NumberFormat("vi-VN").format(Number(n || 0));
const HISTORY_STEP = 6;

export default function MembershipPointsPage() {
  const [account, setAccount] = useState(null);
  const [tiers, setTiers] = useState([]);
  const [rewards, setRewards] = useState([]);
  const [transactions, setTransactions] = useState([]);
  const [policy, setPolicy] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(false);

  // Loyalty theo TỪNG chi nhánh (điểm/hạng mỗi gara khác nhau) + gara đang xem.
  const [garagesData, setGaragesData] = useState([]);
  const [selectedGarageId, setSelectedGarageId] = useState(null);

  const [historyFilter, setHistoryFilter] = useState("all");
  const [historySort, setHistorySort] = useState("newest");
  const [historyLimit, setHistoryLimit] = useState(HISTORY_STEP);

  const [tierView, setTierView] = useState(null);
  const [redeemTarget, setRedeemTarget] = useState(null);
  const [redeeming, setRedeeming] = useState(false);

  const rewardsRef = useRef(null);

  const load = useCallback(async () => {
    setLoading(true);
    setError(false);
    try {
      const raw = await loyaltyApi.getMyLoyalty();
      const accList = Array.isArray(raw) ? raw : (raw?.data ?? raw?.content ?? (raw ? [raw] : []));
      if (!accList.length) {
        setGaragesData([]); setAccount(null); setTiers([]); setRewards([]); setTransactions([]); setPolicy(null);
        return;
      }
      // Mọi gara khách có tài khoản điểm — điểm/hạng RIÊNG của từng gara.
      const garages = accList
        .map((a) => ({
          garageId: a.garageId ?? null,
          garageName: a.garageName ?? "",
          availablePoints: Number(a.availablePoints ?? 0),
          totalPoints: Number(a.totalPoints ?? a.availablePoints ?? 0),
          raw: a,
        }))
        .filter((g) => g.garageId != null);

      // Tải hạng + chính sách của TẤT CẢ gara song song (mỗi gara một cấu hình riêng).
      const [txRes, ...rest] = await Promise.allSettled([
        loyaltyApi.getLoyaltyTransactions(),
        ...garages.map((g) => loyaltyApi.getCustomerTiers(g.garageId)),
        ...garages.map((g) => loyaltyApi.getPolicy(g.garageId)),
        ...garages.map((g) => rewardApi.getCustomerRewards(g.garageId)),
      ]);
      const n = garages.length;
      const tierResults = rest.slice(0, n);
      const policyResults = rest.slice(n, 2 * n);
      const rwResults = rest.slice(2 * n, 3 * n);

      const built = garages.map((g, i) => ({
        garageId: g.garageId,
        garageName: g.garageName,
        availablePoints: g.availablePoints,
        account: normalizeLoyaltyAccount(g.raw),
        tiers: tierResults[i].status === "fulfilled" ? normalizeTiers(tierResults[i].value) : [],
        policy: policyResults[i].status === "fulfilled" ? normalizePolicy(policyResults[i].value) : null,
      }));
      setGaragesData(built);

      // Gara xem mặc định: ưu tiên lựa chọn đã lưu, nếu không thì ladder hạng đầy đủ nhất rồi tới điểm.
      const primary = [...built].sort((a, b) => {
        if (b.tiers.length !== a.tiers.length) return b.tiers.length - a.tiers.length;
        return (b.account?.totalPoints || 0) - (a.account?.totalPoints || 0);
      })[0];
      const stored = getStoredGarageId();
      const validStored = stored != null && built.some((g) => String(g.garageId) === String(stored));
      setSelectedGarageId((prev) => {
        if (prev != null && built.some((g) => String(g.garageId) === String(prev))) return prev;
        return validStored ? stored : primary.garageId;
      });

      setTransactions(txRes.status === "fulfilled" ? normalizeLoyaltyTransactions(txRes.value) : []);

      // Gộp ưu đãi đổi điểm của MỌI gara, gắn gara + điểm khả dụng của gara đó để xét đủ/thiếu điểm.
      const seen = new Set();
      const merged = [];
      rwResults.forEach((r, i) => {
        if (r.status !== "fulfilled") return;
        const g = garages[i];
        normalizeRewards(r.value).forEach((rw) => {
          if (rw.id == null || seen.has(rw.id)) return;
          seen.add(rw.id);
          merged.push({ ...rw, garageId: g.garageId, garageName: g.garageName, availablePoints: g.availablePoints });
        });
      });
      setRewards(merged);
    } catch {
      setError(true);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    load();
  }, [load]);

  // Đổi gara đang xem → cập nhật hạng/điểm/chính sách của gara đó.
  useEffect(() => {
    if (!garagesData.length) return;
    const current = garagesData.find((g) => String(g.garageId) === String(selectedGarageId)) || garagesData[0];
    setAccount(current.account);
    setTiers(current.tiers);
    setPolicy(current.policy);
  }, [garagesData, selectedGarageId]);

  const available = account?.availablePoints ?? 0;
  const progress = useMemo(() => computeTierProgress(account, tiers), [account, tiers]);
  const currentTierIndex = useMemo(() => {
    if (!account) return 0;
    const i = tiers.findIndex(
      (t) =>
        (account.tierId != null && t.id === account.tierId) ||
        (account.tierName && t.name.toLowerCase() === account.tierName.toLowerCase()),
    );
    return i < 0 ? 0 : i;
  }, [account, tiers]);
  const eligibleRewards = useMemo(
    () => rewards.filter((r) => rewardState(r, r.availablePoints).canRedeem).length,
    [rewards],
  );

  // Tab lịch sử — chỉ hiện loại thật sự có trong dữ liệu.
  const historyTabs = useMemo(() => {
    const present = new Set(transactions.map((t) => t.type));
    const base = [{ key: "all", label: "Tất cả" }];
    if (present.has("EARN")) base.push({ key: "EARN", label: "Tích điểm" });
    if (present.has("REDEEM")) base.push({ key: "REDEEM", label: "Đổi quà" });
    if (present.has("ROLLBACK")) base.push({ key: "ROLLBACK", label: "Hoàn điểm" });
    if (present.has("EXPIRE")) base.push({ key: "EXPIRE", label: "Điểm hết hạn" });
    return base;
  }, [transactions]);

  const filteredHistory = useMemo(() => {
    let list = transactions;
    if (historyFilter !== "all") list = list.filter((t) => t.type === historyFilter);
    list = [...list].sort((a, b) => {
      const da = new Date(a.createdAt).getTime();
      const db = new Date(b.createdAt).getTime();
      return historySort === "newest" ? db - da : da - db;
    });
    return list;
  }, [transactions, historyFilter, historySort]);

  useEffect(() => setHistoryLimit(HISTORY_STEP), [historyFilter, historySort]);

  const handleRedeem = useCallback(
    async (reward) => {
      if (reward?.garageId == null) {
        toast.error("Chưa đổi được ưu đãi.", { description: "Không xác định được gara của ưu đãi." });
        return;
      }
      setRedeeming(true);
      try {
        await rewardApi.redeemReward(reward.id, reward.garageId);
        toast.success("Đổi ưu đãi thành công.", { description: "Điểm của bạn đã được cập nhật." });
        setRedeemTarget(null);
        await load();
      } catch (err) {
        toast.error("Chưa đổi được ưu đãi.", { description: friendlyError(err, "Vui lòng thử lại sau.") });
      } finally {
        setRedeeming(false);
      }
    },
    [load],
  );

  const scrollToRewards = () => rewardsRef.current?.scrollIntoView({ behavior: "smooth", block: "start" });

  /* ---------- States ---------- */
  if (loading) {
    return (
      <PageContainer variant="customer" className="pb-32">
        <PageHeader eyebrow="Chương trình thành viên" title="Điểm thưởng của tôi" description="Theo dõi hạng thành viên, điểm tích lũy và các quyền lợi dành cho bạn." />
        <Skeleton className="h-40 rounded-3xl" />
        <div className="grid grid-cols-2 gap-3 lg:grid-cols-4">
          {Array.from({ length: 4 }).map((_, i) => <Skeleton key={i} className="h-20 rounded-2xl" />)}
        </div>
        <Skeleton className="h-48 rounded-2xl" />
      </PageContainer>
    );
  }

  if (error) {
    return (
      <PageContainer variant="customer" className="pb-32">
        <PageHeader eyebrow="Chương trình thành viên" title="Điểm thưởng của tôi" description="Theo dõi hạng thành viên, điểm tích lũy và các quyền lợi dành cho bạn." />
        <div className="rounded-2xl border border-critical/25 bg-critical-container p-10 text-center">
          <span className="mx-auto grid size-12 place-items-center rounded-full bg-critical/10 text-critical"><AlertTriangle size={22} /></span>
          <h2 className="mt-3 text-lg font-extrabold text-critical">Không thể tải dữ liệu điểm thành viên</h2>
          <p className="mt-1 text-sm text-critical/90">Vui lòng thử lại sau.</p>
          <Button onClick={load} className="mt-4 bg-critical text-white hover:bg-critical/90">Thử lại</Button>
        </div>
      </PageContainer>
    );
  }

  if (!account) {
    return (
      <PageContainer variant="customer" className="pb-32">
        <PageHeader eyebrow="Chương trình thành viên" title="Điểm thưởng của tôi" description="Theo dõi hạng thành viên, điểm tích lũy và các quyền lợi dành cho bạn." />
        <EmptyState
          icon={Trophy}
          title="Bạn chưa tham gia chương trình thành viên"
          description="Điểm thưởng được cộng sau khi lần rửa xe đầu tiên của bạn hoàn tất, không phải ngay khi thanh toán."
        />
      </PageContainer>
    );
  }

  const theme = tierTheme(account.tierName);

  return (
    <PageContainer variant="customer" className="pb-32">
      <PageHeader
        eyebrow="Chương trình thành viên"
        title="Điểm thưởng của tôi"
        description="Theo dõi hạng thành viên, điểm tích lũy và các quyền lợi dành cho bạn."
        actions={
          <div className="flex items-center gap-2">
            <Button size="lg" className="shadow-cta" onClick={scrollToRewards}>
              <Gift size={18} /> Đổi điểm lấy quà
            </Button>
            <Button variant="ghost" size="icon" onClick={load} aria-label="Tải lại" title="Tải lại">
              <RotateCcw size={18} />
            </Button>
          </div>
        }
      />

      {/* Chọn chi nhánh — điểm & hạng tính riêng cho từng gara khách có tài khoản */}
      {garagesData.length > 1 && (
        <div className="flex flex-wrap items-center gap-2 rounded-2xl border border-border bg-card px-4 py-3">
          <span className="inline-flex items-center gap-1.5 text-sm font-bold text-foreground">
            <Store size={15} /> Chi nhánh:
          </span>
          <select
            value={String(selectedGarageId ?? "")}
            onChange={(e) => { setSelectedGarageId(e.target.value); storeGarageId(e.target.value); }}
            className="h-9 rounded-xl border border-input bg-background px-3 text-sm font-semibold outline-none focus:border-ring"
          >
            {garagesData.map((g) => (
              <option key={g.garageId} value={String(g.garageId)}>
                {g.garageName || "Chi nhánh"} · {fmt(g.availablePoints)} điểm
              </option>
            ))}
          </select>
          <span className="text-xs text-muted-foreground">Điểm và hạng tính riêng cho từng chi nhánh.</span>
        </div>
      )}

      {/* Hero hạng thành viên — nền/viền/nhấn đổi theo bậc hạng */}
      <section className={`overflow-hidden rounded-3xl border p-6 sm:p-7 ${theme.card} ${theme.border}`}>
        <div className="flex flex-col gap-6 lg:flex-row lg:items-center lg:justify-between">
          <div className="flex items-center gap-4">
            <TierBadge name={account.tierName} index={currentTierIndex} size="size-16" className="rounded-2xl shadow-card" iconSize={30} />
            <div>
              <p className={`text-xs font-bold uppercase tracking-wide ${theme.icon}`}>Hạng hiện tại</p>
              <h2 className="text-2xl font-extrabold">{tierLabel(account.tierName, "Chưa có hạng")}</h2>
              {account.tierDiscountPercentage > 0 && (
                <p className="mt-1 inline-flex items-center gap-1.5 text-sm font-semibold text-success">
                  <BadgePercent size={15} /> Giảm {Number(account.tierDiscountPercentage)}% mỗi lần rửa xe
                </p>
              )}
            </div>
          </div>

          <div className="lg:text-right">
            <p className="text-xs font-semibold text-muted-foreground">Điểm khả dụng</p>
            <p className={`inline-flex items-center gap-2 text-4xl font-extrabold ${theme.icon}`}>
              <Sparkles size={26} /> {fmt(available)}
            </p>
          </div>
        </div>

        {/* Tiến độ */}
        <div className="mt-6">
          {!progress.hasData ? (
            <p className="text-sm text-muted-foreground">Chưa có dữ liệu tiến độ lên hạng.</p>
          ) : progress.isMax ? (
            <p className={`inline-flex items-center gap-2 text-sm font-semibold ${theme.icon}`}>
              <Crown size={16} /> Bạn đang ở hạng cao nhất.
            </p>
          ) : (
            <>
              <div className="flex items-center justify-between text-sm">
                <span className="font-semibold">
                  Còn <b className={theme.icon}>{fmt(progress.pointsToNext)}</b> điểm để lên hạng {tierLabel(progress.next.name)}
                </span>
                <span className="text-muted-foreground">{progress.progressPercent}%</span>
              </div>
              <div className="mt-2 h-2.5 overflow-hidden rounded-full bg-black/5">
                <div className={`h-full rounded-full transition-all ${theme.bar}`} style={{ width: `${progress.progressPercent}%` }} />
              </div>
            </>
          )}
        </div>

        <p className="mt-5 border-t border-black/5 pt-4 text-xs text-muted-foreground">
          Điểm được cộng tự động sau khi gara hoàn tất dịch vụ rửa xe của bạn.
        </p>
      </section>

      {/* KPI */}
      <div className="grid grid-cols-2 gap-3 lg:grid-cols-4">
        <KpiCard label="Điểm khả dụng" value={fmt(available)} icon={<Sparkles size={18} />} />
        <KpiCard label="Tổng điểm đã tích" value={fmt(account.totalPoints)} icon={<Trophy size={18} />} tone="bg-success-container text-success" />
        <KpiCard label="Điểm đã sử dụng" value={fmt(account.usedPoints)} icon={<Gift size={18} />} tone="bg-warning-container text-warning" />
        <KpiCard label="Ưu đãi đủ điểm" value={eligibleRewards} icon={<BadgePercent size={18} />} tone="bg-primary-container text-primary" />
      </div>

      {/* Các hạng thành viên */}
      <section>
        <h2 className="text-lg font-extrabold">Các hạng thành viên</h2>
        {tiers.length === 0 ? (
          <EmptyState className="mt-3" icon={Trophy} title="Chưa có dữ liệu hạng thành viên" description="Thông tin các hạng sẽ được hiển thị tại đây." />
        ) : (
          <div className="mt-3 grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
            {tiers.map((tier, i) => {
              const isCurrent =
                (account.tierId != null && tier.id === account.tierId) ||
                (account.tierName && tier.name.toLowerCase() === account.tierName.toLowerCase());
              return (
                <button
                  key={tier.id ?? tier.name}
                  type="button"
                  onClick={() => setTierView({ tier, isCurrent })}
                  className={`rounded-2xl border bg-card p-4 text-left transition hover:border-primary/40 ${
                    isCurrent ? "border-primary ring-1 ring-primary/30" : "border-border"
                  }`}
                >
                  <div className="flex items-center justify-between">
                    <TierBadge name={tier.name} index={i} size="size-10" iconSize={20} />
                    {isCurrent && (
                      <span className="rounded-full bg-primary-container px-2 py-0.5 text-xs font-bold text-primary">Hạng hiện tại</span>
                    )}
                  </div>
                  <p className="mt-3 font-extrabold">{tierLabel(tier.name)}</p>
                  <p className="mt-0.5 text-sm text-muted-foreground">Từ {fmt(tier.minPoints)} điểm</p>
                  {tier.discountPercentage > 0 && (
                    <p className="mt-1.5 inline-flex items-center gap-1 text-xs font-semibold text-success">
                      <BadgePercent size={13} /> Giảm {Number(tier.discountPercentage)}%
                    </p>
                  )}
                </button>
              );
            })}
          </div>
        )}
      </section>

      {/* Quà có thể đổi */}
      <section ref={rewardsRef} className="scroll-mt-24">
        <div className="flex items-center justify-between">
          <h2 className="text-lg font-extrabold">Ưu đãi có thể đổi</h2>
          <span className="text-sm text-muted-foreground">Điểm khả dụng: <b className="text-primary">{fmt(available)}</b></span>
        </div>
        {rewards.length === 0 ? (
          <EmptyState className="mt-3" icon={Gift} title="Chưa có quà tặng khả dụng" description="Các ưu đãi đổi điểm sẽ được hiển thị tại đây." />
        ) : (
          <div className="mt-3 grid auto-rows-fr gap-3 sm:grid-cols-2 lg:grid-cols-3">
            {rewards.map((reward) => (
              <RewardCard key={reward.id} reward={reward} state={rewardState(reward, reward.availablePoints)} onRedeem={() => setRedeemTarget(reward)} />
            ))}
          </div>
        )}
      </section>

      {/* Cách tích điểm / dùng điểm */}
      <section className="grid gap-3 sm:grid-cols-3">
        <HowToCard
          icon={Sparkles}
          title="Cách tích điểm"
          text={
            policy?.amountPerPoint
              ? `Mỗi ${fmt(policy.amountPerPoint)}đ chi tiêu hợp lệ được tích 1 điểm.`
              : "Hoàn tất lịch rửa xe hợp lệ để nhận điểm."
          }
        />
        <HowToCard icon={Gift} title="Cách dùng điểm" text="Dùng điểm để đổi ưu đãi và quà tặng tại WashMate." />
        <HowToCard
          icon={Clock}
          title="Lưu ý"
          text={
            policy?.pointExpiryMonths
              ? `Điểm có hạn sử dụng ${policy.pointExpiryMonths} tháng kể từ khi được cộng.`
              : "Điểm được cộng sau khi gara hoàn tất dịch vụ rửa xe."
          }
        />
      </section>

      {/* Lịch sử điểm */}
      <section>
        <div className="flex flex-wrap items-center justify-between gap-3">
          <h2 className="text-lg font-extrabold">Lịch sử điểm</h2>
          {transactions.length > 0 && (
            <div className="flex items-center gap-2">
              <div className="flex gap-1.5 overflow-x-auto">
                {historyTabs.map((t) => (
                  <button
                    key={t.key}
                    type="button"
                    onClick={() => setHistoryFilter(t.key)}
                    className={`shrink-0 rounded-lg px-3 py-1.5 text-sm font-bold transition ${
                      historyFilter === t.key ? "bg-primary text-primary-foreground" : "border border-border bg-card text-muted-foreground hover:bg-surface"
                    }`}
                  >
                    {t.label}
                  </button>
                ))}
              </div>
              <select
                value={historySort}
                onChange={(e) => setHistorySort(e.target.value)}
                className="h-9 rounded-lg border border-border bg-card px-2.5 text-sm font-semibold outline-none focus-visible:border-ring"
                aria-label="Sắp xếp"
              >
                <option value="newest">Mới nhất</option>
                <option value="oldest">Cũ nhất</option>
              </select>
            </div>
          )}
        </div>

        {transactions.length === 0 ? (
          <EmptyState className="mt-3" icon={History} title="Bạn chưa có giao dịch điểm nào" description="Điểm sẽ xuất hiện sau khi bạn hoàn tất lịch rửa xe hợp lệ." />
        ) : filteredHistory.length === 0 ? (
          <EmptyState className="mt-3" icon={History} title="Không tìm thấy giao dịch phù hợp" description="Thử đổi bộ lọc hoặc khoảng thời gian." />
        ) : (
          <div className="mt-3 overflow-hidden rounded-2xl border border-border bg-card">
            <div className="divide-y divide-border">
              {filteredHistory.slice(0, historyLimit).map((tx) => (
                <HistoryRow key={tx.id} tx={tx} />
              ))}
            </div>
            {filteredHistory.length > historyLimit && (
              <div className="border-t border-border p-3 text-center">
                <Button variant="ghost" size="sm" onClick={() => setHistoryLimit((n) => n + HISTORY_STEP)}>
                  Xem thêm
                </Button>
              </div>
            )}
          </div>
        )}
      </section>

      <TierDetailDrawer tier={tierView?.tier} account={account} isCurrent={tierView?.isCurrent} onClose={() => setTierView(null)} />
      <RedeemRewardDialog reward={redeemTarget} availablePoints={redeemTarget?.availablePoints ?? available} garageName={redeemTarget?.garageName} submitting={redeeming} onClose={() => !redeeming && setRedeemTarget(null)} onConfirm={handleRedeem} />
    </PageContainer>
  );
}

function RewardCard({ reward, state, onRedeem }) {
  const toneByKey = {
    eligible: "bg-success-container text-success",
    insufficient: "bg-warning-container text-warning",
    out: "bg-muted text-muted-foreground",
    inactive: "bg-muted text-muted-foreground",
  };
  return (
    <article className="flex flex-col rounded-2xl border border-border bg-card p-4">
      <div className="flex items-start justify-between gap-2">
        <span className="grid size-10 place-items-center rounded-xl bg-primary/10 text-primary"><Gift size={18} /></span>
        <span className={`rounded-full px-2.5 py-1 text-xs font-bold ${toneByKey[state.key]}`}>{state.label}</span>
      </div>
      <h3 className="mt-3 font-extrabold">{reward.name}</h3>
      {reward.description && <p className="mt-1 line-clamp-2 text-sm text-muted-foreground">{reward.description}</p>}
      {reward.garageName && (
        <p className="mt-1.5 flex items-center gap-1 text-xs text-muted-foreground">
          <Store size={12} /> {reward.garageName}
        </p>
      )}
      {/* Nhóm dưới đẩy xuống đáy → điểm, ghi chú và nút thẳng hàng giữa các thẻ */}
      <div className="mt-auto pt-3">
        <div className="inline-flex w-fit items-center gap-1.5 rounded-full bg-primary-container px-3 py-1 text-sm font-bold text-primary">
          <Sparkles size={14} /> {fmt(reward.pointsRequired)} điểm
        </div>
        {state.key === "insufficient" && (
          <p className="mt-2 text-xs font-semibold text-warning">Cần thêm {fmt(state.missing)} điểm</p>
        )}
        <div className="mt-3">
          {state.canRedeem ? (
            <Button size="sm" className="w-full" onClick={onRedeem}>Đổi ngay</Button>
          ) : (
            <Button size="sm" variant="outline" className="w-full" disabled>
              {state.label}
            </Button>
          )}
        </div>
      </div>
    </article>
  );
}

function HistoryRow({ tx }) {
  const positive = tx.sign > 0;
  const TagIcon = positive ? Sparkles : Gift;
  return (
    <div className="flex items-center gap-3 p-4">
      <span className={`grid size-10 shrink-0 place-items-center rounded-xl ${positive ? "bg-success-container text-success" : "bg-warning-container text-warning"}`}>
        <TagIcon size={18} />
      </span>
      <div className="min-w-0 flex-1">
        <p className="font-semibold">{tx.description}</p>
        <p className="mt-0.5 text-xs text-muted-foreground">
          <span className="rounded bg-muted px-1.5 py-0.5 font-bold">{tx.label}</span>
          {tx.createdAt ? ` · ${formatBookingDate(tx.createdAt)}` : ""}
        </p>
      </div>
      <strong className={`shrink-0 text-base ${positive ? "text-success" : "text-warning"}`}>
        {positive ? "+" : "-"}{fmt(tx.points)}
      </strong>
    </div>
  );
}

function HowToCard({ icon: Icon, title, text }) {
  return (
    <div className="rounded-2xl border border-border bg-card p-4">
      <span className="grid size-10 place-items-center rounded-xl bg-primary/10 text-primary"><Icon size={18} /></span>
      <p className="mt-3 font-extrabold">{title}</p>
      <p className="mt-1 text-sm text-muted-foreground">{text}</p>
    </div>
  );
}
