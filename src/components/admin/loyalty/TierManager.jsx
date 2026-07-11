import { useCallback, useEffect, useState } from "react";
import { Plus } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";
import { toast } from "@/components/ui/toast";
import { confirmDialog } from "@/components/shared/ConfirmDialog";
import { loyaltyApi } from "@/api/loyaltyApi";
import { formatNumber, friendlyName } from "@/lib/format";

/**
 * Quản lý hạng thành viên theo chi nhánh — API thật:
 *   GET    /api/v1/admin/loyalty-tiers?garageId
 *   POST   /api/v1/admin/loyalty-tiers?garageId  body { tierName, minPoints, maintainPoints, discountPercentage }
 *   PUT    /api/v1/admin/loyalty-tiers/{id}
 *   DELETE /api/v1/admin/loyalty-tiers/{id}
 * Seed mặc định mỗi chi nhánh chỉ có 1 hạng "Đồng" → admin thêm Bạc/Vàng... tại đây.
 */
export function TierManager({ garages, onChanged }) {
  const [garageId, setGarageId] = useState("");
  const [tiers, setTiers] = useState([]);
  const [loading, setLoading] = useState(false);
  const [editing, setEditing] = useState(null); // tier | "new" | null
  const [form, setForm] = useState({ tierName: "", minPoints: "", maintainPoints: "0", discountPercentage: "" });
  const [saving, setSaving] = useState(false);
  const [busyId, setBusyId] = useState(null);

  useEffect(() => {
    if (!garageId && garages.length) setGarageId(String(garages[0]?.id ?? garages[0]?.garageId ?? ""));
  }, [garages, garageId]);

  const loadTiers = useCallback(async (gid) => {
    if (!gid) return;
    setLoading(true);
    try {
      const res = await loyaltyApi.getAdminTiers(gid);
      const list = Array.isArray(res?.content) ? res.content : Array.isArray(res) ? res : [];
      setTiers([...list].sort((a, b) => Number(a.minPoints ?? 0) - Number(b.minPoints ?? 0)));
    } catch {
      setTiers([]);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => { loadTiers(garageId); }, [garageId, loadTiers]);

  function openNew() {
    setForm({ tierName: "", minPoints: "", maintainPoints: "0", discountPercentage: "" });
    setEditing("new");
  }
  function openEdit(t) {
    setForm({
      tierName: t.tierName ?? "",
      minPoints: String(t.minPoints ?? ""),
      maintainPoints: String(t.maintainPoints ?? "0"),
      discountPercentage: String(t.discountPercentage ?? ""),
    });
    setEditing(t);
  }

  async function handleSave() {
    if (!form.tierName.trim()) { toast.error("Tên hạng là bắt buộc."); return; }
    const min = Number(form.minPoints);
    const disc = Number(form.discountPercentage);
    if (!Number.isFinite(min) || min < 0) { toast.error("Điểm tối thiểu phải là số ≥ 0."); return; }
    if (!Number.isFinite(disc) || disc < 0 || disc > 100) { toast.error("Mức giảm phải từ 0–100%."); return; }
    setSaving(true);
    try {
      const payload = {
        tierName: form.tierName.trim(),
        minPoints: min,
        maintainPoints: Number(form.maintainPoints) || 0,
        discountPercentage: disc,
      };
      if (editing === "new") await loyaltyApi.createTier(garageId, payload);
      else await loyaltyApi.updateTier(editing.tierId, payload);
      toast.success("Đã lưu hạng thành viên.");
      setEditing(null);
      await loadTiers(garageId);
      onChanged?.();
    } catch (e) {
      toast.error("Không thể lưu hạng.", { description: e?.message || "Vui lòng thử lại." });
    } finally {
      setSaving(false);
    }
  }

  async function handleDelete(t) {
    const ok = await confirmDialog({
      title: `Xóa hạng "${t.tierName}"?`,
      description: "Chỉ xóa được khi không có khách nào đang ở hạng này.",
      confirmLabel: "Xóa",
      destructive: true,
    });
    if (!ok) return;
    setBusyId(t.tierId);
    try {
      await loyaltyApi.deleteTier(t.tierId);
      toast.success("Đã xóa hạng.");
      await loadTiers(garageId);
      onChanged?.();
    } catch (e) {
      toast.error("Không thể xóa hạng.", { description: e?.message || "Có thể còn khách đang ở hạng này." });
    } finally {
      setBusyId(null);
    }
  }

  const inputCls = "mt-1.5 h-10 w-full rounded-xl border border-input bg-background px-3 text-sm outline-none focus:border-ring";

  return (
    <section className="rounded-2xl border border-border bg-card p-5">
      <div className="flex flex-wrap items-center justify-between gap-2">
        <h2 className="text-lg font-bold text-foreground">Hạng thành viên theo chi nhánh</h2>
        <Button size="sm" onClick={openNew} disabled={!garageId}><Plus /> Thêm hạng</Button>
      </div>
      <p className="mt-0.5 text-xs text-muted-foreground">
        Mỗi chi nhánh mặc định chỉ có 1 hạng. Thêm các hạng cao hơn (Bạc, Vàng...) để khách có mốc lên hạng.
      </p>

      <div className="mt-4">
        <label className="text-xs font-bold text-foreground">Chi nhánh</label>
        <select value={garageId} onChange={(e) => { setGarageId(e.target.value); setEditing(null); }} className={inputCls}>
          {garages.map((g) => (
            <option key={g.id ?? g.garageId} value={g.id ?? g.garageId}>
              {friendlyName(g.name ?? g.garageName, "Chi nhánh chưa cập nhật")}
            </option>
          ))}
        </select>
      </div>

      {editing && (
        <div className="mt-4 rounded-2xl border border-border bg-surface p-4">
          <p className="text-sm font-bold text-foreground">
            {editing === "new" ? "Thêm hạng mới" : `Sửa hạng "${editing.tierName}"`}
          </p>
          <div className="mt-3 grid grid-cols-2 gap-3">
            <div className="col-span-2">
              <label className="text-xs font-bold text-foreground">Tên hạng <span className="text-critical">*</span></label>
              <input value={form.tierName} onChange={(e) => setForm({ ...form, tierName: e.target.value })} placeholder="VD: Bạc" className={inputCls} />
            </div>
            <div>
              <label className="text-xs font-bold text-foreground">Điểm tối thiểu <span className="text-critical">*</span></label>
              <input type="number" min="0" value={form.minPoints} onChange={(e) => setForm({ ...form, minPoints: e.target.value })} placeholder="VD: 500" className={inputCls} />
            </div>
            <div>
              <label className="text-xs font-bold text-foreground">Điểm giữ hạng</label>
              <input type="number" min="0" value={form.maintainPoints} onChange={(e) => setForm({ ...form, maintainPoints: e.target.value })} placeholder="VD: 0" className={inputCls} />
            </div>
            <div>
              <label className="text-xs font-bold text-foreground">Mức giảm (%) <span className="text-critical">*</span></label>
              <input type="number" min="0" max="100" value={form.discountPercentage} onChange={(e) => setForm({ ...form, discountPercentage: e.target.value })} placeholder="VD: 8" className={inputCls} />
            </div>
          </div>
          <div className="mt-3 flex gap-2">
            <Button size="sm" onClick={handleSave} disabled={saving}>{saving ? "Đang lưu..." : "Lưu"}</Button>
            <Button size="sm" variant="outline" onClick={() => setEditing(null)} disabled={saving}>Hủy</Button>
          </div>
        </div>
      )}

      {loading ? (
        <Skeleton className="mt-4 h-40 rounded-2xl" />
      ) : tiers.length === 0 ? (
        <p className="py-10 text-center text-sm text-neutral-muted">Chi nhánh này chưa có hạng nào.</p>
      ) : (
        <div className="mt-4 divide-y divide-border overflow-hidden rounded-2xl border border-border">
          {tiers.map((t) => (
            <div key={t.tierId} className="flex items-center gap-3 px-4 py-3">
              <div className="min-w-0 flex-1">
                <p className="text-sm font-bold text-foreground">{t.tierName}</p>
                <p className="text-xs text-muted-foreground">
                  Từ {formatNumber(t.minPoints || 0)} điểm · Giảm {Number(t.discountPercentage || 0)}%
                </p>
              </div>
              <Button size="sm" variant="outline" onClick={() => openEdit(t)}>Sửa</Button>
              <Button size="sm" variant="destructive" onClick={() => handleDelete(t)} disabled={busyId === t.tierId}>Xóa</Button>
            </div>
          ))}
        </div>
      )}
    </section>
  );
}

export default TierManager;
