import { useCallback, useEffect, useMemo, useState } from "react";
import {
  Star, Coins, Gift, ArrowRightLeft, Search, Plus, RefreshCw, AlertTriangle, Ticket,
} from "lucide-react";
import PageContainer from "@/components/shared/PageContainer";
import PageHeader from "@/components/shared/PageHeader";
import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";
import { toast } from "@/components/ui/toast";
import { confirmDialog } from "@/components/shared/ConfirmDialog";
import { garageApi } from "../../api/garageApi";
import { adminApi } from "../../api/adminApi";
import { rewardApi } from "../../api/rewardApi";
import { loyaltyApi } from "../../api/loyaltyApi";
import { todayISO, formatNumber, friendlyName } from "../../lib/format";
import { cn } from "@/lib/utils";
import { RewardFormModal } from "../../components/admin/loyalty/RewardFormModal";
import {
  AdminRewardDrawer,
  REWARD_STATUS_LABELS,
  REWARD_STATUS_TONES,
} from "../../components/admin/loyalty/AdminRewardDrawer";
import { AdminTierDrawer } from "../../components/admin/loyalty/AdminTierDrawer";
import { TierManager } from "../../components/admin/loyalty/TierManager";

// Mốc điểm & mức giảm giá là CẤU HÌNH NGHIỆP VỤ của hệ thống (product spec).
// BE có endpoint /v1/admin/loyalty-tiers nhưng DTO đang rỗng — trang sẽ thăm dò
// API trước, chỉ dùng cấu hình này khi API chưa trả được dữ liệu dùng được.
const TIER_CONFIG = [
  { name: "Đồng", points: 0, discount: 5, image: "/images/home/04_membership/medals/medal_dong.png" },
  { name: "Bạc", points: 500, discount: 8, image: "/images/home/04_membership/medals/medal_bac.png" },
  { name: "Vàng", points: 1500, discount: 12, image: "/images/home/04_membership/medals/medal_vang.png" },
  { name: "Bạch Kim", points: 3500, discount: 15, image: "/images/home/04_membership/medals/medal_bach_kim.png" },
  { name: "Kim Cương", points: 8000, discount: 20, image: "/images/home/04_membership/medals/medal_kim_cuong.png" },
];

const TABS = [
  { key: "tiers", label: "Hạng thành viên" },
  { key: "rewards", label: "Ưu đãi đổi điểm" },
  { key: "policy", label: "Chính sách tích điểm" },
  { key: "transactions", label: "Giao dịch điểm" },
  { key: "redemptions", label: "Lượt đổi thưởng" },
];

function LoyaltySkeleton() {
  return (
    <div className="space-y-6">
      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3 2xl:grid-cols-5">
        {Array.from({ length: 5 }, (_, i) => <Skeleton key={i} className="h-24 rounded-2xl" />)}
      </div>
      <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-5">
        {Array.from({ length: 5 }, (_, i) => <Skeleton key={i} className="h-56 rounded-2xl" />)}
      </div>
    </div>
  );
}

/**
 * Trang Tích điểm & Thành viên (Admin) — dữ liệu thật:
 *   ưu đãi: GET /v1/admin/promotion-rewards?garageId (song song mọi gara) + CRUD thật
 *   điểm phát sinh/đã dùng: GET /owner/insights (rule-based aggregate, kỳ = tháng này)
 *   hạng: thăm dò GET /v1/admin/loyalty-tiers (DTO đang rỗng) → cấu hình nghiệp vụ
 * Giao dịch điểm & lượt đổi thưởng: BE chưa có API admin → empty state.
 */
export default function AdminLoyaltyPage() {
  const [garages, setGarages] = useState([]);
  const [rewards, setRewards] = useState([]);
  const [pointsSummary, setPointsSummary] = useState(null); // { earned, redeemed } | null
  const [beTiers, setBeTiers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [lastUpdated, setLastUpdated] = useState(null);

  const [garageFilter, setGarageFilter] = useState("all");
  const [tab, setTab] = useState("tiers");
  const [rewardKeyword, setRewardKeyword] = useState("");
  const [rewardStatus, setRewardStatus] = useState("ALL");

  const [formTarget, setFormTarget] = useState(null); // { reward | null }
  const [rewardDetail, setRewardDetail] = useState(null);
  const [tierDetail, setTierDetail] = useState(null);
  const [busyId, setBusyId] = useState(null);

  const load = useCallback(async () => {
    setLoading(true);
    setError(null);
    const today = todayISO();
    const [gRes, iRes] = await Promise.allSettled([
      garageApi.getAll(),
      adminApi.getOwnerInsights({ fromDate: `${today.slice(0, 8)}01`, toDate: today }),
    ]);
    const garageList = gRes.status === "fulfilled" && Array.isArray(gRes.value) ? gRes.value : [];
    setGarages(garageList);
    if (iRes.status === "fulfilled") {
      const s = iRes.value?.summary;
      setPointsSummary(s ? { earned: Number(s.totalPointsEarned || 0), redeemed: Number(s.totalPointsRedeemed || 0) } : null);
    } else {
      setPointsSummary(null);
    }

    if (gRes.status === "rejected") {
      setError(gRes.reason?.message || "Không thể tải dữ liệu tích điểm. Vui lòng thử lại.");
      setRewards([]);
      setBeTiers([]);
      setLoading(false);
      return;
    }

    // Hạng thành viên thật theo từng gara — gộp, khử trùng theo tên hạng.
    const tierResults = await Promise.allSettled(
      garageList.map((g) => loyaltyApi.getAdminTiers(g.id ?? g.garageId)),
    );
    const tierSeen = new Set();
    const mergedTiers = [];
    tierResults.forEach((r) => {
      if (r.status !== "fulfilled") return;
      const list = Array.isArray(r.value?.content) ? r.value.content : Array.isArray(r.value) ? r.value : [];
      list.forEach((t) => {
        const key = String(t.tierName ?? t.name ?? "").toLowerCase();
        if (!key || tierSeen.has(key)) return;
        tierSeen.add(key);
        mergedTiers.push(t);
      });
    });
    setBeTiers(mergedTiers.sort((a, b) => Number(a.minPoints ?? 0) - Number(b.minPoints ?? 0)));

    // Ưu đãi của TẤT CẢ gara — endpoint admin theo từng gara, tải song song
    const results = await Promise.allSettled(
      garageList.map((g) => rewardApi.getAdminRewards(g.id ?? g.garageId)),
    );
    const all = [];
    results.forEach((r, i) => {
      if (r.status !== "fulfilled") return;
      const page = r.value;
      const list = Array.isArray(page?.content) ? page.content : Array.isArray(page) ? page : [];
      const garage = garageList[i];
      list.forEach((rw) => all.push({
        ...rw,
        garageId: rw.garageId ?? garage.id ?? garage.garageId,
        garageName: garage.name ?? garage.garageName,
      }));
    });
    setRewards(all);
    setLastUpdated(new Date());
    setLoading(false);
  }, []);

  useEffect(() => { load(); }, [load]);

  // Hạng thành viên: dùng dữ liệu BE nếu API trả field dùng được, ngược lại cấu hình nghiệp vụ.
  const tiers = useMemo(() => {
    const usable = beTiers.filter((t) => t && (t.name || t.tierName));
    if (usable.length > 0) {
      return usable.map((t, i) => ({
        name: friendlyName(t.name || t.tierName, "Hạng chưa cập nhật"),
        points: Number(t.minPoints ?? t.tierMinPoints ?? 0),
        discount: Number(t.discountPercentage ?? t.tierDiscountPercentage ?? 0),
        image: TIER_CONFIG[i]?.image || null,
      }));
    }
    return TIER_CONFIG;
  }, [beTiers]);

  const filteredRewards = useMemo(() => {
    const kw = rewardKeyword.trim().toLowerCase();
    return rewards.filter((r) => {
      if (garageFilter !== "all" && String(r.garageId) !== String(garageFilter)) return false;
      if (rewardStatus !== "ALL" && r.status !== rewardStatus) return false;
      if (kw && !`${r.name || ""} ${r.description || ""}`.toLowerCase().includes(kw)) return false;
      return true;
    });
  }, [rewards, garageFilter, rewardStatus, rewardKeyword]);

  const remaining = pointsSummary ? Math.max(0, pointsSummary.earned - pointsSummary.redeemed) : null;

  const KPI_CARDS = [
    { key: "members", label: "Thành viên loyalty", Icon: Star, tone: "text-gold-ink bg-gold/20", pendingApi: true },
    { key: "earned", label: "Điểm phát sinh", Icon: Coins, tone: "text-primary bg-primary-container", value: pointsSummary?.earned, sub: "Tháng này" },
    { key: "redeemed", label: "Điểm đã sử dụng", Icon: ArrowRightLeft, tone: "text-success bg-success-container", value: pointsSummary?.redeemed, sub: "Tháng này" },
    { key: "remaining", label: "Điểm còn lại", Icon: Coins, tone: "text-accent-violet bg-accent-violet/10", value: remaining, sub: "Chênh lệch tháng này" },
    { key: "redemptions", label: "Lượt đổi thưởng", Icon: Gift, tone: "text-accent-cyan bg-accent-cyan/10", pendingApi: true },
  ];

  // Tạm ẩn / kích hoạt ưu đãi — confirm rồi PUT /v1/admin/promotion-rewards/{id}.
  async function handleToggleReward(reward) {
    const hiding = reward.status === "ACTIVE";
    const ok = await confirmDialog({
      title: hiding ? "Tạm ẩn ưu đãi này?" : "Kích hoạt ưu đãi này?",
      description: hiding
        ? "Ưu đãi sẽ không còn hiển thị cho khách đổi điểm."
        : "Ưu đãi sẽ hiển thị lại cho khách đổi điểm.",
      confirmLabel: hiding ? "Xác nhận tạm ẩn" : "Kích hoạt",
      destructive: hiding,
    });
    if (!ok) return;
    setBusyId(reward.rewardId);
    try {
      await rewardApi.updateReward(reward.rewardId, {
        name: reward.name,
        description: reward.description,
        pointsRequired: reward.pointsRequired,
        stock: reward.stock,
        status: hiding ? "INACTIVE" : "ACTIVE",
      });
      toast.success(hiding ? "Đã tạm ẩn ưu đãi" : "Đã kích hoạt ưu đãi", { description: reward.name });
      load();
    } catch (e) {
      toast.error("Thao tác thất bại", { description: e?.message || "Lỗi không xác định" });
    } finally {
      setBusyId(null);
    }
  }

  // BE chưa có API cập nhật hạng (DTO rỗng) — không fake.
  function handleEditTier() {
    toast.info("Chức năng chưa được hệ thống hỗ trợ", {
      description: "Chỉnh sửa hạng thành viên sẽ được kích hoạt khi hệ thống hỗ trợ cấu hình tương ứng.",
    });
  }

  const updatedLabel = lastUpdated
    ? lastUpdated.toLocaleTimeString("vi-VN", { hour: "2-digit", minute: "2-digit", second: "2-digit" })
    : null;

  return (
    <PageContainer>
      <PageHeader
        eyebrow="Quản trị hệ thống"
        title="Tích điểm & Thành viên"
        description="Quản lý hạng thành viên, điểm thưởng, ưu đãi đổi điểm và giao dịch loyalty."
        actions={
          <div className="flex flex-wrap items-center gap-2">
            <select
              value={garageFilter}
              onChange={(e) => setGarageFilter(e.target.value)}
              className="h-10 rounded-xl border border-input bg-background px-3 text-xs font-bold outline-none focus:border-ring"
              aria-label="Chọn gara"
            >
              <option value="all">Tất cả gara</option>
              {garages.map((g) => (
                <option key={g.id ?? g.garageId} value={g.id ?? g.garageId}>
                  {friendlyName(g.name ?? g.garageName, "Gara chưa cập nhật")}
                </option>
              ))}
            </select>
            <Button variant="outline" size="sm" onClick={load} disabled={loading}>
              <RefreshCw className={loading ? "animate-spin" : ""} /> Tải lại
            </Button>
            <Button size="sm" onClick={() => setFormTarget({ reward: null })}>
              <Plus /> Thêm ưu đãi
            </Button>
            {updatedLabel && (
              <span className="text-xs font-medium text-muted-foreground">Cập nhật lúc {updatedLabel}</span>
            )}
          </div>
        }
      />

      {loading && !rewards.length && !garages.length ? (
        <LoyaltySkeleton />
      ) : error ? (
        <div className="rounded-2xl border border-critical/25 bg-critical-container p-8 text-center">
          <AlertTriangle className="mx-auto mb-3 text-critical" size={28} />
          <p className="text-sm font-bold text-critical">{error}</p>
          <Button size="sm" onClick={load} className="mt-4 bg-critical text-white hover:bg-critical/90">Thử lại</Button>
        </div>
      ) : (
        <>
          {/* KPI */}
          <section className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3 2xl:grid-cols-5">
            {KPI_CARDS.map(({ key, label, Icon, tone, value, sub, pendingApi }) => (
              <article key={key} className="flex items-center gap-3 rounded-2xl border border-border bg-card p-4">
                <span className={`grid h-10 w-10 shrink-0 place-items-center rounded-xl ${tone}`}>
                  <Icon size={18} />
                </span>
                <div>
                  <p className="text-xs font-semibold text-muted-foreground">{label}</p>
                  <b className="mt-0.5 block text-xl font-semibold text-foreground">
                    {pendingApi || value == null ? "—" : formatNumber(value)}
                  </b>
                  <p className="text-xs text-neutral-muted">
                    {pendingApi || value == null ? "Chưa có dữ liệu" : sub}
                  </p>
                </div>
              </article>
            ))}
          </section>

          {/* Tabs */}
          <div className="no-scrollbar flex gap-1 overflow-x-auto rounded-xl border border-border bg-card p-1 sm:w-fit">
            {TABS.map((t) => (
              <button
                key={t.key}
                type="button"
                onClick={() => setTab(t.key)}
                className={cn(
                  "shrink-0 rounded-lg px-4 py-2 text-xs font-bold transition",
                  tab === t.key ? "bg-primary text-white" : "text-muted-foreground hover:text-foreground",
                )}
              >
                {t.label}
              </button>
            ))}
          </div>

          {tab === "tiers" && (
            <div className="grid grid-cols-1 gap-6 xl:grid-cols-[minmax(0,1fr)_340px]">
              <TierManager garages={garages} onChanged={load} />

              {/* Tổng quan tích điểm — số thật từ dữ liệu vận hành, kỳ = tháng này */}
              <section className="h-fit rounded-2xl border border-border bg-card p-5">
                <h2 className="flex items-center gap-2 text-lg font-bold text-foreground">
                  <Star size={18} className="text-primary" /> Tổng quan tích điểm
                </h2>
                {pointsSummary ? (
                  <div className="mt-4 grid grid-cols-2 gap-4">
                    {[
                      ["Tổng điểm đã phát sinh", pointsSummary.earned, "text-foreground"],
                      ["Tổng điểm đã sử dụng", pointsSummary.redeemed, "text-success"],
                      ["Điểm còn lại của khách", remaining, "text-foreground"],
                      ["Khách hàng có điểm", null, "text-primary"],
                    ].map(([label, value, cls]) => (
                      <div key={label}>
                        <p className={`text-lg font-semibold ${cls}`}>{value == null ? "—" : formatNumber(value)}</p>
                        <p className="mt-0.5 text-xs font-semibold leading-4 text-muted-foreground">
                          {label}
                          {value == null && <span className="block text-neutral-muted">Chưa có dữ liệu</span>}
                        </p>
                      </div>
                    ))}
                  </div>
                ) : (
                  <p className="py-8 text-center text-xs text-neutral-muted">
                    Chưa có dữ liệu tích điểm trong kỳ này.
                  </p>
                )}
              </section>
            </div>
          )}

          {tab === "rewards" && (
            <>
              <section className="flex flex-wrap items-center gap-3 rounded-2xl border border-border bg-card p-4">
                <label className="flex h-10 min-w-[200px] flex-1 items-center gap-2 rounded-xl border border-border px-3 lg:max-w-sm">
                  <Search size={16} className="text-neutral-muted" />
                  <input
                    value={rewardKeyword}
                    onChange={(e) => setRewardKeyword(e.target.value)}
                    placeholder="Tìm theo tên ưu đãi, mô tả..."
                    className="w-full bg-transparent text-sm outline-none"
                  />
                </label>
                <select
                  value={rewardStatus}
                  onChange={(e) => setRewardStatus(e.target.value)}
                  className="h-10 rounded-xl border border-input bg-background px-3 text-xs font-bold outline-none focus:border-ring"
                  aria-label="Lọc trạng thái ưu đãi"
                >
                  <option value="ALL">Tất cả trạng thái</option>
                  <option value="ACTIVE">Đang hoạt động</option>
                  <option value="INACTIVE">Tạm ẩn</option>
                  <option value="OUT_OF_STOCK">Hết quà</option>
                </select>
              </section>

              {filteredRewards.length === 0 ? (
                <div className="rounded-2xl border border-border bg-card px-6 py-14 text-center">
                  <Ticket size={40} className="mx-auto text-border" />
                  <p className="mt-3 text-sm font-semibold text-foreground">Chưa có ưu đãi đổi điểm.</p>
                  <p className="mt-1 text-xs text-muted-foreground">
                    Tạo ưu đãi để khách có thể dùng điểm đổi thưởng.
                  </p>
                  <Button size="sm" className="mt-4" onClick={() => setFormTarget({ reward: null })}>
                    <Plus /> Thêm ưu đãi
                  </Button>
                </div>
              ) : (
                <div className="grid gap-4 lg:grid-cols-2 xl:grid-cols-3">
                  {filteredRewards.map((r) => {
                    const busy = busyId === r.rewardId;
                    const active = r.status === "ACTIVE";
                    return (
                      <article key={r.rewardId} className="flex flex-col rounded-2xl border border-border bg-card p-5">
                        <div className="flex items-start justify-between gap-2">
                          <h3 className="text-sm font-bold text-foreground">
                            {friendlyName(r.name, "Ưu đãi chưa cập nhật")}
                          </h3>
                          <span className={`shrink-0 rounded-full px-2.5 py-0.5 text-xs font-bold ${REWARD_STATUS_TONES[r.status] || "bg-muted text-muted-foreground"}`}>
                            {REWARD_STATUS_LABELS[r.status] || r.status || "—"}
                          </span>
                        </div>
                        <p className="mt-1 text-lg font-semibold text-primary">
                          {formatNumber(r.pointsRequired || 0)} điểm
                        </p>
                        <p className="mt-0.5 text-xs text-muted-foreground">
                          Còn {formatNumber(r.stock || 0)} lượt · Không giới hạn thời gian
                        </p>
                        <p className="mt-2 line-clamp-2 min-h-8 text-xs leading-4 text-muted-foreground">
                          {friendlyName(r.description, "Mô tả chưa cập nhật")}
                        </p>
                        <span className="mt-3 w-fit rounded-full bg-primary-container px-2.5 py-0.5 text-xs font-bold text-primary-strong">
                          Áp dụng: {friendlyName(r.garageName, "Gara chưa cập nhật")}
                        </span>
                        <div className="mt-4 flex flex-wrap gap-1.5 border-t border-border pt-3">
                          <Button size="sm" variant="outline" onClick={() => setRewardDetail(r)}>Chi tiết</Button>
                          <Button size="sm" variant="outline" onClick={() => setFormTarget({ reward: r })}>Chỉnh sửa</Button>
                          {r.status !== "OUT_OF_STOCK" && (
                            <Button
                              size="sm"
                              variant={active ? "destructive" : "default"}
                              disabled={busy}
                              onClick={() => handleToggleReward(r)}
                            >
                              {busy ? "..." : active ? "Tạm ẩn" : "Kích hoạt"}
                            </Button>
                          )}
                        </div>
                      </article>
                    );
                  })}
                </div>
              )}
            </>
          )}

          {tab === "policy" && <PolicyPanel garages={garages} />}

          {tab === "transactions" && (
            // BE chưa có API admin xem giao dịch điểm toàn hệ thống — không fake
            <div className="rounded-2xl border border-border bg-card px-6 py-14 text-center">
              <ArrowRightLeft size={40} className="mx-auto text-border" />
              <p className="mt-3 text-sm font-semibold text-foreground">Chưa có giao dịch điểm.</p>
              <p className="mt-1 text-xs text-muted-foreground">
                Dữ liệu giao dịch điểm sẽ hiển thị khi hệ thống được cập nhật.
              </p>
            </div>
          )}

          {tab === "redemptions" && (
            // BE chưa có API admin xem lượt đổi thưởng — không fake
            <div className="rounded-2xl border border-border bg-card px-6 py-14 text-center">
              <Gift size={40} className="mx-auto text-border" />
              <p className="mt-3 text-sm font-semibold text-foreground">Chưa có lượt đổi thưởng.</p>
              <p className="mt-1 text-xs text-muted-foreground">
                Dữ liệu đổi thưởng sẽ hiển thị khi hệ thống được cập nhật.
              </p>
            </div>
          )}
        </>
      )}

      <RewardFormModal
        reward={formTarget?.reward || null}
        garages={garages}
        open={Boolean(formTarget)}
        onOpenChange={(open) => { if (!open) setFormTarget(null); }}
        onDone={load}
      />
      <AdminRewardDrawer
        reward={rewardDetail}
        open={Boolean(rewardDetail)}
        onOpenChange={(open) => { if (!open) setRewardDetail(null); }}
      />
      <AdminTierDrawer
        tier={tierDetail}
        open={Boolean(tierDetail)}
        onOpenChange={(open) => { if (!open) setTierDetail(null); }}
      />
    </PageContainer>
  );
}

/**
 * Quản lý chính sách tích điểm theo chi nhánh — API thật:
 *   GET/POST/PUT/DELETE /api/v1/admin/loyalty/policy?garageId
 *   body: { amountPerPoint, pointExpiryMonths, autoEnroll }
 */
function PolicyPanel({ garages }) {
  const [garageId, setGarageId] = useState("");
  const [form, setForm] = useState({ amountPerPoint: "", pointExpiryMonths: "", autoEnroll: true });
  const [exists, setExists] = useState(false);
  const [loading, setLoading] = useState(false);
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    if (!garageId && garages.length) setGarageId(String(garages[0]?.id ?? garages[0]?.garageId ?? ""));
  }, [garages, garageId]);

  const loadPolicy = useCallback(async (gid) => {
    if (!gid) return;
    setLoading(true);
    try {
      const res = await loyaltyApi.getAdminPolicy(gid);
      const p = res?.data ?? res;
      if (p && p.policyId != null) {
        setExists(true);
        setForm({
          amountPerPoint: String(p.amountPerPoint ?? ""),
          pointExpiryMonths: String(p.pointExpiryMonths ?? ""),
          autoEnroll: Boolean(p.autoEnroll),
        });
      } else {
        setExists(false);
        setForm({ amountPerPoint: "", pointExpiryMonths: "", autoEnroll: true });
      }
    } catch {
      setExists(false);
      setForm({ amountPerPoint: "", pointExpiryMonths: "", autoEnroll: true });
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => { loadPolicy(garageId); }, [garageId, loadPolicy]);

  async function handleSave() {
    const amount = Number(form.amountPerPoint);
    const months = Number(form.pointExpiryMonths);
    if (!Number.isFinite(amount) || amount <= 0) { toast.error("Số tiền cho mỗi điểm phải là số > 0."); return; }
    if (!Number.isFinite(months) || months <= 0) { toast.error("Số tháng hết hạn phải là số > 0."); return; }
    setSaving(true);
    try {
      const payload = { amountPerPoint: amount, pointExpiryMonths: months, autoEnroll: Boolean(form.autoEnroll) };
      if (exists) await loyaltyApi.updatePolicy(garageId, payload);
      else await loyaltyApi.createPolicy(garageId, payload);
      toast.success("Đã lưu chính sách tích điểm.");
      await loadPolicy(garageId);
    } catch (e) {
      toast.error("Không thể lưu chính sách.", { description: e?.message || "Vui lòng thử lại." });
    } finally {
      setSaving(false);
    }
  }

  async function handleDelete() {
    const ok = await confirmDialog({
      title: "Xóa chính sách tích điểm?",
      description: "Chi nhánh này sẽ không còn chính sách riêng cho tới khi bạn tạo lại.",
      confirmLabel: "Xóa",
      destructive: true,
    });
    if (!ok) return;
    setSaving(true);
    try {
      await loyaltyApi.deletePolicy(garageId);
      toast.success("Đã xóa chính sách tích điểm.");
      await loadPolicy(garageId);
    } catch (e) {
      toast.error("Không thể xóa chính sách.", { description: e?.message || "Vui lòng thử lại." });
    } finally {
      setSaving(false);
    }
  }

  const inputCls = "mt-1.5 h-11 w-full rounded-xl border border-input bg-background px-3 text-sm outline-none focus:border-ring";

  return (
    <div className="max-w-xl rounded-2xl border border-border bg-card p-5">
      <h2 className="text-lg font-bold text-foreground">Chính sách tích điểm</h2>
      <p className="mt-0.5 text-xs text-muted-foreground">
        Cấu hình cách khách tích điểm và thời hạn điểm cho từng chi nhánh.
      </p>

      <div className="mt-4 space-y-4">
        <div>
          <label className="text-xs font-bold text-foreground">Chi nhánh</label>
          <select
            value={garageId}
            onChange={(e) => setGarageId(e.target.value)}
            className={inputCls}
          >
            {garages.map((g) => (
              <option key={g.id ?? g.garageId} value={g.id ?? g.garageId}>
                {friendlyName(g.name ?? g.garageName, "Chi nhánh chưa cập nhật")}
              </option>
            ))}
          </select>
        </div>

        {loading ? (
          <Skeleton className="h-40 rounded-2xl" />
        ) : (
          <>
            <span className={`inline-block rounded-full px-2.5 py-0.5 text-xs font-bold ${exists ? "bg-success-container text-success" : "bg-muted text-muted-foreground"}`}>
              {exists ? "Chi nhánh đã có chính sách" : "Chưa có chính sách — sẽ tạo mới khi lưu"}
            </span>

            <div>
              <label className="text-xs font-bold text-foreground">Số tiền cho mỗi điểm (đ) <span className="text-critical">*</span></label>
              <input
                type="number"
                min="1"
                value={form.amountPerPoint}
                onChange={(e) => setForm({ ...form, amountPerPoint: e.target.value })}
                placeholder="VD: 10000 (10.000đ = 1 điểm)"
                className={inputCls}
              />
              <p className="mt-1 text-xs text-muted-foreground">Khách chi tiêu đủ số tiền này được cộng 1 điểm.</p>
            </div>

            <div>
              <label className="text-xs font-bold text-foreground">Điểm hết hạn sau (tháng) <span className="text-critical">*</span></label>
              <input
                type="number"
                min="1"
                value={form.pointExpiryMonths}
                onChange={(e) => setForm({ ...form, pointExpiryMonths: e.target.value })}
                placeholder="VD: 12"
                className={inputCls}
              />
            </div>

            <div>
              <label className="text-xs font-bold text-foreground">Tự động ghi danh thành viên</label>
              <select
                value={form.autoEnroll ? "yes" : "no"}
                onChange={(e) => setForm({ ...form, autoEnroll: e.target.value === "yes" })}
                className={inputCls}
              >
                <option value="yes">Có — tự tạo tài khoản điểm cho khách mới</option>
                <option value="no">Không</option>
              </select>
            </div>

            <div className="flex flex-wrap gap-2 pt-1">
              <Button size="sm" onClick={handleSave} disabled={saving || !garageId}>
                {saving ? "Đang lưu..." : exists ? "Lưu thay đổi" : "Tạo chính sách"}
              </Button>
              {exists && (
                <Button size="sm" variant="destructive" onClick={handleDelete} disabled={saving}>
                  Xóa chính sách
                </Button>
              )}
            </div>
          </>
        )}
      </div>
    </div>
  );
}
