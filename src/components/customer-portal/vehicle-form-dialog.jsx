import { useEffect, useMemo, useState } from "react";
import { X } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { CAR_BRANDS } from "@/lib/car-models";

const OTHER_BRAND = "Khác (Hãng khác)";
const OTHER_MODEL = "Khác";
const empty = { licensePlate: "", brand: "", customBrand: "", model: "", customModel: "", color: "" };

const selectClass =
  "h-11 w-full rounded-xl border border-border bg-card px-3.5 text-sm font-medium text-foreground outline-none focus-visible:border-ring disabled:bg-muted disabled:text-muted-foreground";

/** Ánh xạ xe thật → giá trị form (khớp hãng/dòng trong danh mục, phần còn lại vào ô "Khác"). */
function toForm(vehicle) {
  if (!vehicle) return empty;
  const brandObj = CAR_BRANDS.find((b) => b.brand.toLowerCase() === (vehicle.brand || "").toLowerCase());
  const brand = brandObj ? brandObj.brand : vehicle.brand ? OTHER_BRAND : "";
  const models = brandObj?.models || [];
  const matchedModel = models.find((m) => m.toLowerCase() === (vehicle.model || "").toLowerCase());
  return {
    licensePlate: vehicle.licensePlate || "",
    brand,
    customBrand: brandObj ? "" : vehicle.brand || "",
    model: matchedModel || (vehicle.model ? OTHER_MODEL : ""),
    customModel: matchedModel ? "" : vehicle.model || "",
    color: vehicle.color || "",
  };
}

/**
 * Modal thêm/sửa xe. Gọi API THẬT ở component cha qua onSubmit(payload) — không fake lưu.
 * Props: open, mode ('add'|'edit'), vehicle, submitting, onClose, onSubmit.
 */
export function VehicleFormDialog({ open, mode = "add", vehicle, submitting = false, onClose, onSubmit }) {
  const [form, setForm] = useState(empty);
  const [error, setError] = useState("");

  useEffect(() => {
    if (open) {
      setForm(toForm(mode === "edit" ? vehicle : null));
      setError("");
    }
  }, [open, mode, vehicle]);

  const models = useMemo(
    () => CAR_BRANDS.find((b) => b.brand === form.brand)?.models || [],
    [form.brand],
  );

  if (!open) return null;

  const change = (name) => (e) => {
    const value = e.target.value;
    setForm((cur) => {
      if (name === "brand") return { ...cur, brand: value, model: "", customBrand: "", customModel: "" };
      if (name === "model") return { ...cur, model: value, customModel: "" };
      return { ...cur, [name]: value };
    });
  };

  const submit = () => {
    const brand = form.brand === OTHER_BRAND ? form.customBrand.trim() : form.brand.trim();
    const model = form.model === OTHER_MODEL ? form.customModel.trim() : form.model.trim();
    const licensePlate = form.licensePlate.trim().toUpperCase();
    const color = form.color.trim();
    if (!licensePlate || !brand || !model) {
      setError("Vui lòng nhập biển số, chọn hãng xe và dòng xe.");
      return;
    }
    setError("");
    onSubmit({ licensePlate, brand, model, color });
  };

  return (
    <div className="fixed inset-0 z-[60] flex items-center justify-center p-4">
      <button type="button" aria-label="Đóng" onClick={onClose} className="wm-drawer-backdrop absolute inset-0 bg-foreground/40" />
      <div className="relative w-full max-w-md rounded-2xl border border-border bg-card p-6 shadow-floating">
        <div className="mb-5 flex items-center justify-between">
          <h2 className="text-xl font-extrabold">{mode === "edit" ? "Sửa thông tin xe" : "Thêm xe mới"}</h2>
          <button
            type="button"
            onClick={onClose}
            aria-label="Đóng"
            className="grid size-9 place-items-center rounded-xl border border-border text-muted-foreground transition hover:bg-surface"
          >
            <X size={18} />
          </button>
        </div>

        <div className="space-y-4">
          <div>
            <label className="mb-1.5 block text-sm font-semibold">Hãng xe <span className="text-critical">*</span></label>
            <select value={form.brand} onChange={change("brand")} className={selectClass}>
              <option value="">-- Chọn hãng xe --</option>
              {CAR_BRANDS.map((b) => (
                <option key={b.brand} value={b.brand}>{b.brand}</option>
              ))}
            </select>
            {form.brand === OTHER_BRAND && (
              <Input value={form.customBrand} onChange={change("customBrand")} placeholder="Nhập tên hãng xe..." className="mt-2 h-11 rounded-xl" />
            )}
          </div>

          <div>
            <label className="mb-1.5 block text-sm font-semibold">Dòng xe <span className="text-critical">*</span></label>
            <select value={form.model} onChange={change("model")} disabled={!form.brand} className={selectClass}>
              <option value="">{form.brand ? "-- Chọn dòng xe --" : "-- Chọn hãng xe trước --"}</option>
              {models.map((m) => (
                <option key={m} value={m}>{m}</option>
              ))}
            </select>
            {form.model === OTHER_MODEL && (
              <Input value={form.customModel} onChange={change("customModel")} placeholder="Nhập tên dòng xe..." className="mt-2 h-11 rounded-xl" />
            )}
          </div>

          <div>
            <label className="mb-1.5 block text-sm font-semibold">Biển số xe <span className="text-critical">*</span></label>
            <Input value={form.licensePlate} onChange={change("licensePlate")} placeholder="VD: 51A-238.88" className="h-11 rounded-xl font-mono font-semibold" />
          </div>

          <div>
            <label className="mb-1.5 block text-sm font-semibold">Màu sơn</label>
            <Input value={form.color} onChange={change("color")} placeholder="VD: Trắng" className="h-11 rounded-xl" />
          </div>

          {error && (
            <p className="rounded-xl bg-critical-container px-3 py-2 text-sm font-semibold text-critical">{error}</p>
          )}
        </div>

        <div className="mt-6 flex gap-3">
          <Button variant="outline" size="lg" onClick={onClose} className="flex-1" disabled={submitting}>
            Hủy
          </Button>
          <Button size="lg" onClick={submit} className="flex-1 shadow-cta" disabled={submitting}>
            {submitting ? "Đang lưu..." : mode === "edit" ? "Lưu thay đổi" : "Thêm xe"}
          </Button>
        </div>
      </div>
    </div>
  );
}

export default VehicleFormDialog;
