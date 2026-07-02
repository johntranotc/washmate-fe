import { useCallback, useEffect, useMemo, useState } from "react";
import { ArrowLeft, ArrowRight } from "lucide-react";
import { Link } from "react-router-dom";
import { vehicleApi } from "@/api/vehicleApi";
import { servicePackageApi } from "@/api/servicePackageApi";
import { garageApi } from "@/api/garageApi";
import { bookingSlotApi } from "@/api/bookingSlotApi";
import { bookingApi } from "@/api/bookingApi";
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

export default function CustomerBookingFlowPage() {
  const [step, setStep] = useState(1);
  const [vehicles, setVehicles] = useState([]);
  const [allServices, setAllServices] = useState([]);
  const [garages, setGarages] = useState([]);
  const [slots, setSlots] = useState([]);
  const [selection, setSelection] = useState({
    garage: null,
    service: null,
    vehicle: null,
    date: nextDates()[0].value,
    slot: null,
  });
  const [note, setNote] = useState("");
  const [paymentMethod, setPaymentMethod] = useState("CASH");
  const [promotion, setPromotion] = useState(null);
  const [loading, setLoading] = useState(true);
  const [slotLoading, setSlotLoading] = useState(false);
  const [serviceLoading, setServiceLoading] = useState(false);
  const [loadError, setLoadError] = useState("");
  const [submitError, setSubmitError] = useState("");
  const [submitting, setSubmitting] = useState(false);
  const [result, setResult] = useState(null);

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
      setSelection((cur) => ({ ...cur, slot: null }));
      if (!garageId) {
        setSlots([]);
        setSlotLoading(false);
        return;
      }
      try {
        const data = await bookingSlotApi.getAvailable({ garageId, date: selection.date });
        const normalized = asList(data)
          .map(normalizeSlot)
          .filter((slot) => !slot.garageId || String(slot.garageId) === String(garageId));

        if (active) setSlots(normalized);
      } catch {
        if (active) setSlots([]);
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
    setStep((cur) => Math.min(cur + 1, 5));
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
          ? `Bản ghi xe cũ "${selection.vehicle.licensePlate}" bị lỗi dữ liệu trên máy chủ Backend. Bạn vui lòng vào tab "Xe của tôi", bấm Xóa xe này đi rồi bấm "Thêm phương tiện" tạo lại xe này là đặt lịch thành công 100%!`
          : `Lỗi đồng bộ xe (${selection.vehicle.licensePlate}): ${errStr || "Máy chủ từ chối cập nhật"}. Vui lòng sang tab "Xe của tôi" bấm Chỉnh sửa và Lưu lại xe này.`;
        setSubmitError(guide);
        setSubmitting(false);
        return;
      }
      const response = await bookingApi.createBooking(payload);
      const normalizedResult = normalizeBookingResponse(response);
      if (payload.bookingNote) {
        try {
          const notesMap = JSON.parse(localStorage.getItem("washmate_booking_notes") || "{}");
          const bid = normalizedResult?.id || normalizedResult?.bookingId || response?.id;
          const bcode = normalizedResult?.code || normalizedResult?.bookingCode || response?.bookingCode;
          if (bid) notesMap[bid] = payload.bookingNote;
          if (bcode) notesMap[bcode] = payload.bookingNote;
          localStorage.setItem("washmate_booking_notes", JSON.stringify(notesMap));
          localStorage.setItem("washmate_latest_booking_note", payload.bookingNote);
        } catch {}
      }
      setResult({
        ...normalizedResult,
        bookingStatus: "PENDING",
        promotion,
        discountAmount,
      });
      setStep(6);
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
        />
      );
    }
    // Step 6: Hoàn tất
    return <BookingSuccessStep result={result} selection={selection} paymentMethod={paymentMethod} promotion={result?.promotion || promotion} discountAmount={result?.discountAmount || 0} />;
  }

  return (
    <div className="mx-auto max-w-7xl space-y-7 p-4 sm:p-8 pb-32">
      <header className="flex flex-col gap-5 sm:flex-row sm:items-end sm:justify-between">
        <div>
          <p className="text-sm font-extrabold uppercase tracking-[0.18em] text-primary">
            Đặt lịch thông minh
          </p>
          <h1 className="mt-2 text-3xl font-extrabold tracking-tight text-foreground sm:text-4xl">
            Đặt lịch rửa xe
          </h1>
          <p className="mt-3 max-w-2xl text-sm leading-6 text-muted-foreground">
            Chọn gara, dịch vụ, xe và khung giờ phù hợp. Gara sẽ xác nhận lịch hẹn trong thời gian sớm nhất.
          </p>
        </div>
        <Link
          to="/khach-hang"
          className="inline-flex items-center gap-2 self-start rounded-2xl border border-border bg-card px-4 py-3 text-sm font-bold text-foreground shadow-sm"
        >
          <ArrowLeft size={17} /> Quay lại
        </Link>
      </header>

      <BookingStepper currentStep={step} />



      {submitError && (
        <div role="alert" className="rounded-2xl border border-red-200 bg-red-50 px-5 py-4 text-sm font-semibold text-red-700">
          {submitError}
        </div>
      )}

      {content()}

      {step < 6 && !loading && !loadError && (
        <div className="sticky bottom-4 sm:bottom-6 z-50 mx-auto mt-8 flex w-[95%] sm:w-auto sm:max-w-fit items-center justify-between gap-3 sm:gap-6 rounded-full border border-white/60 bg-white/50 sm:bg-white/30 px-4 sm:px-6 py-3 shadow-[0_8px_32px_0_rgba(31,38,135,0.18)] backdrop-blur-2xl transition-all duration-300">
          <button
            type="button"
            onClick={() => {
              setSubmitError("");
              setStep((cur) => Math.max(1, cur - 1));
            }}
            disabled={step === 1 || submitting}
            className="inline-flex items-center justify-center gap-1.5 rounded-full border border-white/80 bg-white/80 sm:bg-white/50 px-4 sm:px-5 py-2 text-sm font-bold text-slate-800 shadow-sm backdrop-blur-md transition-all hover:bg-white/80 active:scale-95 disabled:cursor-not-allowed disabled:opacity-40"
          >
            <ArrowLeft size={16} /> <span className="hidden sm:inline">Quay lại</span>
          </button>

          {step < 5 ? (
            <button
              type="button"
              onClick={goNext}
              className="inline-flex flex-1 sm:flex-none items-center justify-center gap-1.5 rounded-full bg-gradient-to-r from-blue-600/90 to-primary/90 px-5 sm:px-7 py-2 text-sm font-extrabold text-white shadow-[0_4px_15px_rgba(11,140,255,0.4)] backdrop-blur-md transition-all hover:scale-105 hover:from-blue-600 hover:to-primary active:scale-95"
            >
              Tiếp tục <ArrowRight size={16} />
            </button>
          ) : (
            <button
              type="button"
              onClick={createBooking}
              disabled={submitting}
              className="inline-flex flex-1 sm:flex-none items-center justify-center gap-1.5 rounded-full bg-gradient-to-r from-blue-600/90 to-primary/90 px-5 sm:px-7 py-2 text-sm font-extrabold text-white shadow-[0_4px_15px_rgba(11,140,255,0.4)] backdrop-blur-md transition-all hover:scale-105 hover:from-blue-600 hover:to-primary active:scale-95 disabled:opacity-60"
            >
              <span className="truncate max-w-[140px] sm:max-w-none">{submitting ? "Đang gửi..." : "Hoàn tất đặt lịch"}</span>
              <ArrowRight size={16} className="shrink-0" />
            </button>
          )}
        </div>
      )}
    </div>
  );
}
