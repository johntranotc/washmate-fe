import { useEffect, useMemo, useState } from "react";
import { Sparkles, Send, Users, ShieldCheck, X, RefreshCw } from "lucide-react";
import { Button } from "@/components/ui/button";
import { toast } from "@/components/ui/toast";
import { adminApi } from "../../../api/adminApi";

/**
 * Modal "Soạn chiến dịch gửi khách" cho AI insight.
 *
 * Luồng human-in-the-loop: AI (phía BE) soạn nháp email + đề xuất voucher →
 * owner xem/sửa trong modal này → bấm gửi thì BE mới tạo voucher + gửi mail thật.
 *
 * BE contract (2 endpoint, xem adminApi.previewInsightCampaign / sendInsightCampaign):
 *  - preview: { targetCount, subject, body, suggestedDiscountType, suggestedDiscountValue }
 *  - send:    payload { garageId, discountType, discountValue, voucherValidDays, subject, body }
 *             → { sentCount }
 */
export function CampaignComposeDialog({ insight, garages = [], open, onClose }) {
  const [loading, setLoading] = useState(false);
  const [sending, setSending] = useState(false);
  const [targetCount, setTargetCount] = useState(null);
  const [sampleEmails, setSampleEmails] = useState([]);
  const [garageId, setGarageId] = useState("");
  const [discountType, setDiscountType] = useState("PERCENTAGE");
  const [discountValue, setDiscountValue] = useState(15);
  const [voucherValidDays, setVoucherValidDays] = useState(14);
  const [subject, setSubject] = useState("");
  const [body, setBody] = useState("");

  // Nháp dự phòng khi BE chưa có endpoint preview (để UI demo được ngay).
  const fallbackDraft = useMemo(() => {
    const title = insight?.title || "Ưu đãi dành riêng cho bạn";
    return {
      targetCount: null,
      subject: `${title} — nhận ngay ưu đãi`,
      body:
        "Chào {tên khách}, chúng tôi có một ưu đãi dành riêng cho bạn. " +
        "Đặt lịch rửa xe trong thời gian tới để nhận voucher giảm giá. Hẹn gặp bạn tại AutoWash!",
      suggestedDiscountType: "PERCENTAGE",
      suggestedDiscountValue: 15,
    };
  }, [insight]);

  useEffect(() => {
    if (!open || !insight) return;
    let alive = true;
    setLoading(true);
    setGarageId(garages?.[0]?.id != null ? String(garages[0].id) : "");
    adminApi
      .previewInsightCampaign(insight.id)
      .then((res) => {
        if (!alive) return;
        const d = res?.data ?? res ?? {};
        applyDraft(d);
      })
      .catch(() => {
        if (!alive) return;
        applyDraft(fallbackDraft);
      })
      .finally(() => alive && setLoading(false));
    return () => {
      alive = false;
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [open, insight]);

  function applyDraft(d) {
    setTargetCount(d.targetCount ?? null);
    setSampleEmails(Array.isArray(d.sampleEmails) ? d.sampleEmails : []);
    setSubject(d.subject ?? fallbackDraft.subject);
    setBody(d.body ?? fallbackDraft.body);
    setDiscountType(d.suggestedDiscountType ?? "PERCENTAGE");
    setDiscountValue(d.suggestedDiscountValue ?? 15);
  }

  async function handleSend() {
    if (!subject.trim() || !body.trim()) {
      toast.error("Thiếu nội dung", { description: "Cần có tiêu đề và nội dung email." });
      return;
    }
    if (garages.length > 0 && !garageId) {
      toast.error("Chưa chọn chi nhánh", { description: "Voucher cần gắn với một chi nhánh." });
      return;
    }
    setSending(true);
    try {
      const res = await adminApi.sendInsightCampaign(insight.id, {
        garageId: garageId ? Number(garageId) : null,
        discountType,
        discountValue: Number(discountValue),
        voucherValidDays: Number(voucherValidDays),
        subject,
        body,
      });
      const sent = res?.data?.sentCount ?? res?.sentCount;
      toast.success("Đã gửi chiến dịch", {
        description: sent != null ? `Đã gửi ${sent} email kèm voucher.` : "Chiến dịch đã được gửi.",
      });
      onClose?.();
    } catch (err) {
      toast.error("Gửi thất bại", { description: err?.message || "Vui lòng thử lại." });
    } finally {
      setSending(false);
    }
  }

  if (!open || !insight) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/45 p-4" role="dialog" aria-modal="true">
      <div className="w-full max-w-xl rounded-2xl border border-border bg-card p-5 shadow-floating">
        <div className="flex items-center gap-2">
          <Send size={18} className="text-primary" />
          <h2 className="text-base font-bold text-foreground">Soạn chiến dịch gửi khách</h2>
          <button onClick={onClose} className="ml-auto text-muted-foreground hover:text-foreground" aria-label="Đóng">
            <X size={18} />
          </button>
        </div>
        <p className="mt-1 text-xs text-muted-foreground">Từ insight: {insight.title}</p>

        <div className="mt-3 rounded-xl bg-surface px-3 py-2.5">
          <div className="flex items-center gap-2">
            <Users size={18} className="text-muted-foreground" />
            <span className="text-xs text-foreground">
              {loading
                ? "Đang xác định tệp khách..."
                : targetCount != null
                  ? <>Gửi tới <b className="font-bold">{targetCount} khách</b> trong tệp mục tiêu</>
                  : "Gửi tới tệp khách của insight này"}
            </span>
          </div>
          {!loading && sampleEmails.length > 0 && (
            <p className="mt-1.5 break-words pl-6 text-xs text-muted-foreground">
              Ví dụ: {sampleEmails.join(", ")}
              {targetCount != null && targetCount > sampleEmails.length ? ` … và ${targetCount - sampleEmails.length} khách khác` : ""}
            </p>
          )}
        </div>

        <div className="mt-3 grid grid-cols-1 gap-3 sm:grid-cols-3">
          {garages.length > 0 && (
            <label className="text-xs">
              <span className="mb-1 block text-muted-foreground">Chi nhánh (voucher)</span>
              <select
                value={garageId}
                onChange={(e) => setGarageId(e.target.value)}
                className="w-full rounded-xl border border-input bg-card px-2.5 py-2 text-xs text-foreground"
              >
                {garages.map((g) => (
                  <option key={g.id} value={g.id}>{g.name}</option>
                ))}
              </select>
            </label>
          )}
          <label className="text-xs">
            <span className="mb-1 block text-muted-foreground">Loại ưu đãi</span>
            <select
              value={discountType}
              onChange={(e) => setDiscountType(e.target.value)}
              className="w-full rounded-xl border border-input bg-card px-2.5 py-2 text-xs text-foreground"
            >
              <option value="PERCENTAGE">Giảm theo %</option>
              <option value="FIXED_AMOUNT">Giảm số tiền</option>
            </select>
          </label>
          <label className="text-xs">
            <span className="mb-1 block text-muted-foreground">
              {discountType === "PERCENTAGE" ? "Giá trị (%)" : "Giá trị (VND)"}
            </span>
            <input
              type="number"
              min="0"
              value={discountValue}
              onChange={(e) => setDiscountValue(e.target.value)}
              className="w-full rounded-xl border border-input bg-card px-2.5 py-2 text-xs text-foreground"
            />
          </label>
          <label className="text-xs">
            <span className="mb-1 block text-muted-foreground">Voucher hết hạn sau (ngày)</span>
            <input
              type="number"
              min="1"
              value={voucherValidDays}
              onChange={(e) => setVoucherValidDays(e.target.value)}
              className="w-full rounded-xl border border-input bg-card px-2.5 py-2 text-xs text-foreground"
            />
          </label>
        </div>

        <div className="mt-3">
          <div className="mb-1.5 flex items-center gap-2">
            <span className="text-xs text-muted-foreground">Nội dung email</span>
            <span className="inline-flex items-center gap-1 rounded-full bg-accent-violet/10 px-2 py-0.5 text-[11px] font-bold text-accent-violet">
              <Sparkles size={11} /> Nháp bởi AI · sửa được
            </span>
          </div>
          <input
            value={subject}
            onChange={(e) => setSubject(e.target.value)}
            placeholder="Tiêu đề email"
            className="mb-2 w-full rounded-xl border border-input bg-card px-3 py-2 text-xs text-foreground"
          />
          <textarea
            value={body}
            onChange={(e) => setBody(e.target.value)}
            rows={5}
            placeholder="Nội dung email"
            className="w-full rounded-xl border border-input bg-card px-3 py-2 text-xs leading-5 text-foreground"
          />
        </div>

        <div className="mt-3 flex items-center gap-2 rounded-xl bg-warning-container px-3 py-2 text-warning">
          <ShieldCheck size={15} />
          <span className="text-[11px] leading-4">
            AI soạn nháp — bạn duyệt — hệ thống mới gửi. Email chỉ gửi sau khi bạn bấm.
          </span>
        </div>

        <div className="mt-4 flex justify-end gap-2">
          <Button variant="outline" onClick={onClose} disabled={sending}>Huỷ</Button>
          <Button onClick={handleSend} disabled={loading || sending}>
            {sending ? <RefreshCw size={15} className="animate-spin" /> : <Send size={15} />}
            {targetCount != null ? `Gửi ${targetCount} email` : "Gửi chiến dịch"}
          </Button>
        </div>
      </div>
    </div>
  );
}

/** Rule code có hành động gửi chiến dịch (email + voucher). */
export const ACTIONABLE_RULE_CODES = new Set([
  "POINTS_EXPIRING_SOON",
  "INACTIVE_WINBACK",
  "LOW_RETURNING_CUSTOMER_RATE",
  "LOW_POINT_REDEMPTION",
  "HIGH_VALUE_CUSTOMER_GROUP",
]);
