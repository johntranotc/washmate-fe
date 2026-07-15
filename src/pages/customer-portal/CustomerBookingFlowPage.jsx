import { useCallback, useEffect, useMemo, useState } from "react";
import PageContainer from "@/components/shared/PageContainer";
import PageHeader from "@/components/shared/PageHeader";
import { ArrowLeft, ArrowRight } from "lucide-react";
import { Link, useSearchParams } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { vehicleApi } from "@/api/vehicleApi";
import { servicePackageApi } from "@/api/servicePackageApi";
import { garageApi } from "@/api/garageApi";
import { bookingSlotApi } from "@/api/bookingSlotApi";
import { bookingApi } from "@/api/bookingApi";
import { loyaltyApi } from "@/api/loyaltyApi";
import { fetchLoyaltyByGarage } from "@/lib/customer-loyalty-data";
import { BookingStepper } from "@/components/customer/booking/BookingStepper";
import { StepError, StepLoading } from "@/components/customer/booking/BookingStates";
import { VehicleStep } from "@/components/customer/booking/VehicleStep";
import { ServiceStep } from "@/components/customer/booking/ServiceStep";
import { GarageStep } from "@/components/customer/booking/GarageStep";
import { SlotStep } from "@/components/customer/booking/SlotStep";
import { BookingReviewStep } from "@/components/customer/booking/BookingReviewStep";
import { BookingSuccessStep } from "@/components/customer/booking/BookingSuccessStep";
import {
  asList,
  bookingErrorMessage,
  getGarageId,
  nextDates,
  normalizeBookingResponse,
  normalizeBookingDate,
  normalizeGarage,
  normalizeService,
  normalizeSlot,
  normalizeVehicle,
} from "@/lib/booking-flow";


// Step order: 1=Gara, 2=Service, 3=Vehicle, 4=Slot, 5=Review, 6=Success

// Draft trong sessionStorage để F5/back không mất luồng đặt lịch đang dở.
const DRAFT_KEY = "washmate_booking_draft";

function readDraft() {
  try {
    return JSON.parse(sessionStorage.getItem(DRAFT_KEY) || "null");
  } catch {
    return null;
  }
}

export default function CustomerBookingFlowPage() {
  const [searchParams, setSearchParams] = useSearchParams();
  const [vehicles, setVehicles] = useState([]);
  const [allServices, setAllServices] = useState([]);
  const [garages, setGarages] = useState([]);
  const [slots, setSlots] = useState([]);
  const [selection, setSelection] = useState(() => {
    const draft = readDraft();
    const dateOptions = nextDates();
    const draftDate = draft?.selection?.date;
    return {
      garage: draft?.selection?.garage ?? null,
      service: draft?.selection?.service ?? null,
      vehicle: draft?.selection?.vehicle ?? null,
      date: dateOptions.some((d) => d.value === draftDate) ? draftDate : dateOptions[0].value,
      slot: draft?.selection?.slot ?? null,
    };
  });
  const [note, setNote] = useState(() => readDraft()?.note ?? "");
  const [paymentMethod, setPaymentMethod] = useState(() => readDraft()?.paymentMethod ?? "CASH");
  const [promotion, setPromotion] = useState(() => readDraft()?.promotion ?? null);
  const [loading, setLoading] = useState(true);
  const [slotLoading, setSlotLoading] = useState(false);
  const [serviceLoading, setServiceLoading] = useState(false);
  const [loadError, setLoadError] = useState("");
  const [submitError, setSubmitError] = useState("");
  const [submitting, setSubmitting] = useState(false);
  const [result, setResult] = useState(null);
  // Hạng thành viên thật của khách tại gara ĐANG CHỌN (tên hạng + % giảm) — để hiển thị
  // mức trừ theo hạng ở bước xác nhận và màn hoàn tất, KHỚP với BE và trang Điểm thành viên.
  const [tier, setTier] = useState(null);

  useEffect(() => {
    const gid = getGarageId(selection.garage);
    if (!gid) { setTier(null); return; }
    let alive = true;
    fetchLoyaltyByGarage(garageApi, loyaltyApi)
      .then((list) => {
        if (!alive) return;
        const g = list.find((x) => String(x.garageId) === String(gid));
        setTier(g && g.tierPercent > 0 ? { name: g.tierName || "Thành viên", percent: g.tierPercent } : null);
      })
      .catch(() => { if (alive) setTier(null); });
    return () => { alive = false; };
  }, [selection.garage]);

  // Step nằm trên URL (?step=N) để F5/back/forward giữ đúng vị trí,
  // clamp về bước đầu tiên còn thiếu dữ liệu để không nhảy cóc.
  const maxStep = !selection.garage
    ? 1
    : !selection.service
      ? 2
      : !selection.vehicle
        ? 3
        : !(selection.date && selection.slot)
          ? 4
          : 5;
  const urlStep = Number.parseInt(searchParams.get("step"), 10) || 1;
  const step = result ? 6 : Math.min(Math.max(urlStep, 1), maxStep);

  const gotoStep = useCallback(
    (next) => {
      setSubmitError("");
      setSearchParams({ step: String(next) });
    },
    [setSearchParams],
  );

  // Persist draft mỗi khi lựa chọn thay đổi; xóa khi đặt lịch thành công.
  useEffect(() => {
    try {
      if (result) {
        sessionStorage.removeItem(DRAFT_KEY);
      } else {
        sessionStorage.setItem(DRAFT_KEY, JSON.stringify({ selection, note, paymentMethod, promotion }));
      }
    } catch {}
  }, [selection, note, paymentMethod, promotion, result]);

  const loadFoundationData = useCallback(async () => {
    setLoading(true);
    setLoadError("");
    try {
      const [vehicleResult, garageResult] = await Promise.allSettled([
        vehicleApi.getMyVehicles(),
        garageApi.getAll(),
      ]);

      const apiVehicles = vehicleResult.status === "fulfilled" ? asList(vehicleResult.value).map(normalizeVehicle).filter((v) => v.status === "ACTIVE") : [];
      const apiGarages = garageResult.status === "fulfilled" ? asList(garageResult.value).map(normalizeGarage).filter((g) => g.status === "ACTIVE") : [];

      setVehicles(apiVehicles);
      setGarages(apiGarages);

      if (!apiGarages.length) {
        setLoadError("Không thể tải danh sách gara.");
      }
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    loadFoundationData();
  }, [loadFoundationData]);

  // Load services when garage changes
  useEffect(() => {
    if (!selection.garage) {
      setAllServices([]);
      return;
    }
    let active = true;
    async function loadServices() {
      const garageId = getGarageId(selection.garage);
      setServiceLoading(true);
      try {
        const data = await servicePackageApi.getAll(garageId);
        const normalized = asList(data).map(normalizeService).filter((s) => s.status === "ACTIVE");
        if (active) setAllServices(normalized);
      } catch {
        if (active) setAllServices([]);
      } finally {
        if (active) setServiceLoading(false);
      }
    }
    loadServices();
    return () => { active = false; };
  }, [selection.garage]);

  // Services filtered for the selected garage
  const servicesForGarage = useMemo(() => {
    return allServices;
  }, [allServices]);

  // Load slots when garage + date change
  useEffect(() => {
    if (!selection.garage || !selection.date) {
      setSlots([]);
      return;
    }
    let active = true;
    async function loadSlots() {
      const garageId = getGarageId(selection.garage);
      setSlotLoading(true);
      if (!garageId) {
        setSlots([]);
        setSelection((cur) => ({ ...cur, slot: null }));
        setSlotLoading(false);
        return;
      }
      try {
        const data = await bookingSlotApi.getAvailable({ garageId, date: selection.date });
        const normalized = asList(data)
          .map(normalizeSlot)
          .filter((slot) => !slot.garageId || String(slot.garageId) === String(garageId));

        if (active) {
          setSlots(normalized);
          // Giữ slot đã chọn (vd. restore từ draft) nếu vẫn còn khả dụng, ngược lại bỏ chọn.
          setSelection((cur) => {
            const match = cur.slot && normalized.find((s) => String(s.id) === String(cur.slot.id) && !s.disabled);
            return match ? { ...cur, slot: match } : { ...cur, slot: null };
          });
        }
      } catch {
        if (active) {
          setSlots([]);
          setSelection((cur) => ({ ...cur, slot: null }));
        }
      } finally {
        if (active) setSlotLoading(false);
      }
    }
    loadSlots();
    return () => { active = false; };
  }, [selection.date, selection.garage]);

  function selectGarage(garage) {
    setSelection((cur) => ({
      ...cur,
      garage,
      service: null, // clear service when garage changes
      slot: null,
    }));
  }

  function selectService(service) {
    setSelection((cur) => ({ ...cur, service, slot: null }));
  }

  function canContinue() {
    if (step === 1) return Boolean(selection.garage) && Boolean(selection.garage.isOpen);
    if (step === 2) return Boolean(selection.service);
    if (step === 3) return Boolean(selection.vehicle);
    if (step === 4) return Boolean(selection.date && selection.slot && !selection.slot.disabled);
    return true;
  }

  function goNext() {
    setSubmitError("");
    if (!canContinue()) {
      if (step === 1 && selection.garage && !selection.garage.isOpen) {
        setSubmitError("Gara này đang tạm đóng. Vui lòng chọn gara khác.");
      } else {
        setSubmitError("Vui lòng chọn đầy đủ thông tin trước khi tiếp tục.");
      }
      return;
    }
    gotoStep(Math.min(step + 1, 5));
  }

  async function createBooking() {
    if (submitting) return;
    if (!selection.garage || !selection.service || !selection.vehicle || !selection.slot) {
      setSubmitError("Vui lòng chọn đầy đủ thông tin đặt lịch.");
      return;
    }
    const bookingDate = normalizeBookingDate(selection.slot.slotDate || selection.date);
    if (!bookingDate) {
      setSubmitError("Vui lòng chọn ngày đặt lịch.");
      return;
    }
    const garageId = getGarageId(selection.garage);
    if (!garageId) {
      setSubmitError("Không tìm thấy gara hợp lệ. Vui lòng tải lại danh sách gara.");
      return;
    }
    if (selection.slot.disabled) {
      setSubmitError("Khung giờ này đã đầy hoặc tạm đóng.");
      return;
    }

    setSubmitting(true);
    setSubmitError("");

    let discountAmount = 0;
    if (promotion && selection.service?.price) {
      if (String(promotion.discountType || "").toUpperCase().includes("PERCENT")) {
        const disc = (selection.service.price * promotion.discountValue) / 100;
        discountAmount = promotion.maxDiscount ? Math.min(disc, promotion.maxDiscount) : disc;
      } else {
        discountAmount = Math.min(promotion.discountValue || 0, selection.service.price);
      }
    }

    const payload = {
      vehicleId: selection.vehicle.id,
      serviceId: selection.service.id,
      garageId,
      slotId: selection.slot.id,
      bookingDate,
      paymentMethod: paymentMethod === "CASH" ? "CASH" : "VNPAY",
      promotionId: (promotion && !isNaN(Number(promotion.id))) ? Number(promotion.id) : null,
      discountAmount,
      bookingNote: (note.trim() + (promotion ? ` [Mã ưu đãi: ${promotion.code} - Giảm ${discountAmount}đ]` : "")).trim(),
    };

    const cleanStr = (str, def) => (str && typeof str === "string" && str.trim() ? str.trim() : def);
    const vid = selection.vehicle.id || selection.vehicle.vehicleId;
    try {
      try {
        await vehicleApi.updateVehicle(vid, {
          ...selection.vehicle,
          licensePlate: cleanStr(selection.vehicle.licensePlate, "CHƯA CẬP NHẬT").toUpperCase(),
          brand: cleanStr(selection.vehicle.brand, "Khác"),
          model: cleanStr(selection.vehicle.model, "Tiêu chuẩn"),
          color: cleanStr(selection.vehicle.color, "Trắng"),
          status: "ACTIVE",
        });
      } catch (err) {
        console.error("Sync error:", err);
        const errStr = err?.message || "";
        const guide = (errStr.toLowerCase().includes("internal server error") || err?.status === 500)
          ? `Bản ghi xe cũ "${selection.vehicle.licensePlate}" bị lỗi dữ liệu trên hệ thống. Bạn vui lòng vào tab "Xe của tôi", bấm Xóa xe này đi rồi bấm "Thêm phương tiện" tạo lại xe này là đặt lịch thành công 100%!`
          : `Lỗi đồng bộ xe (${selection.vehicle.licensePlate}): ${errStr || "Máy chủ từ chối cập nhật"}. Vui lòng sang tab "Xe của tôi" bấm Chỉnh sửa và Lưu lại xe này.`;
        setSubmitError(guide);
        setSubmitting(false);
        return;
      }
      const response = await bookingApi.createBooking(payload);
      const normalizedResult = normalizeBookingResponse(response);
      // Ghi chú KHÔNG lưu localStorage nữa: BE chưa nhận bookingNote khi tạo
      // booking nên ghi chú hiện chưa được lưu — blocker chờ BE bổ sung field.
      setResult({
        ...normalizedResult,
        bookingStatus: "PENDING",
        promotion,
        // Ưu tiên số giảm THẬT của BE (gồm giảm theo hạng); chỉ fallback số FE tự tính khi BE không trả.
        discountAmount: normalizedResult.discountAmount != null ? normalizedResult.discountAmount : discountAmount,
      });
    } catch (error) {
      setSubmitError(bookingErrorMessage(error));
    } finally {
      setSubmitting(false);
    }
  }

  function content() {
    if (loading) return <StepLoading />;
    if (loadError) return <StepError message={loadError} onRetry={loadFoundationData} />;

    // Step 1: Chọn gara
    if (step === 1) {
      return (
        <GarageStep
          garages={garages}
          selectedId={getGarageId(selection.garage)}
          onSelect={(garage) => setSelection((current) => ({ ...current, garage, slot: null }))}
        />
      );
    }
    // Step 2: Chọn dịch vụ (theo gara)
    if (step === 2) {
      return (
        <ServiceStep
          services={servicesForGarage}
          selectedId={selection.service?.id}
          onSelect={selectService}
          garageName={selection.garage?.name}
        />
      );
    }
    // Step 3: Chọn xe
    if (step === 3) {
      return (
        <VehicleStep
          vehicles={vehicles}
          selectedId={selection.vehicle?.id}
          onSelect={(vehicle) => {
            setSelection((cur) => ({ ...cur, vehicle }));
            const cleanStr = (str, def) => (str && typeof str === "string" && str.trim() ? str.trim() : def);
            const vid = vehicle.id || vehicle.vehicleId;
            vehicleApi.updateVehicle(vid, {
              ...vehicle,
              licensePlate: cleanStr(vehicle.licensePlate, "CHƯA CẬP NHẬT").toUpperCase(),
              brand: cleanStr(vehicle.brand, "Khác"),
              model: cleanStr(vehicle.model, "Tiêu chuẩn"),
              color: cleanStr(vehicle.color, "Trắng"),
              status: "ACTIVE",
            }).catch((err) => console.warn("onSelect sync error:", err));
          }}
        />
      );
    }
    // Step 4: Chọn ngày & khung giờ
    if (step === 4) {
      return (
        <SlotStep
          date={selection.date}
          onDateChange={(date) => setSelection((cur) => ({ ...cur, date, slot: null }))}
          slots={slots}
          selectedId={selection.slot?.id}
          onSelect={(slot) => setSelection((cur) => ({ ...cur, slot }))}
          loading={slotLoading}
        />
      );
    }
    // Step 5: Xác nhận
    if (step === 5) {
      return (
        <BookingReviewStep
          selection={selection}
          note={note}
          onNoteChange={setNote}
          paymentMethod={paymentMethod}
          onPaymentMethodChange={setPaymentMethod}
          promotion={promotion}
          onSelectPromotion={setPromotion}
          tier={tier}
        />
      );
    }
    // Step 6: Hoàn tất
    return <BookingSuccessStep result={result} selection={selection} paymentMethod={paymentMethod} promotion={result?.promotion || promotion} discountAmount={result?.discountAmount || 0} tier={tier} />;
  }

  return (
    <PageContainer variant="customer" className="pb-32">
      <PageHeader
        title="Đặt lịch rửa xe"
        description="Chọn gara, dịch vụ, xe và khung giờ phù hợp. Gara sẽ xác nhận lịch hẹn trong thời gian sớm nhất."
        actions={
          <Button variant="outline" size="lg" render={<Link to="/khach-hang" />}>
            <ArrowLeft /> Quay lại
          </Button>
        }
      />

      <BookingStepper currentStep={step} />



      {submitError && (
        <div role="alert" className="rounded-2xl border border-critical/25 bg-critical-container px-5 py-4 text-sm font-semibold text-critical">
          {submitError}
        </div>
      )}

      {content()}

      {step < 6 && !loading && !loadError && (
        <div className="sticky bottom-4 sm:bottom-6 z-50 mx-auto mt-8 flex w-[95%] sm:w-auto sm:max-w-fit items-center justify-between gap-3 sm:gap-6 rounded-full border border-border bg-card px-4 sm:px-6 py-3 shadow-floating transition-all duration-300">
          <Button
            variant="outline"
            size="sm"
            onClick={() => gotoStep(Math.max(1, step - 1))}
            disabled={step === 1 || submitting}
            className="rounded-full"
          >
            <ArrowLeft /> <span className="hidden sm:inline">Quay lại</span>
          </Button>

          {step < 5 ? (
            <Button
              size="sm"
              onClick={goNext}
              className="flex-1 rounded-full px-5 shadow-cta sm:flex-none sm:px-7"
            >
              Tiếp tục <ArrowRight />
            </Button>
          ) : (
            <Button
              size="sm"
              onClick={createBooking}
              disabled={submitting}
              className="flex-1 rounded-full px-5 shadow-cta sm:flex-none sm:px-7"
            >
              <span className="truncate max-w-[140px] sm:max-w-none">{submitting ? "Đang gửi..." : "Hoàn tất đặt lịch"}</span>
              <ArrowRight className="shrink-0" />
            </Button>
          )}
        </div>
      )}
    </PageContainer>
  );
}
