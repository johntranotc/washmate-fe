import { useCallback, useEffect, useMemo, useState } from "react";
import { ArrowLeft, ArrowRight } from "lucide-react";
import { Link } from "react-router-dom";
import { vehicleApi } from "@/api/vehicleApi";
import { servicePackageApi } from "@/api/servicePackageApi";
import { garageApi } from "@/api/garageApi";
import { bookingSlotApi } from "@/api/bookingSlotApi";
import { bookingApi } from "@/api/bookingApi";
import { useAppStore } from "@/state/AppStore";
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


export default function CustomerBookingFlowPage() {
  const { state, actions } = useAppStore();
  const demoMode = localStorage.getItem("accessToken") === "demo-access-token";
  const [step, setStep] = useState(1);
  const [vehicles, setVehicles] = useState([]);
  const [services, setServices] = useState([]);
  const [garages, setGarages] = useState([]);
  const [slots, setSlots] = useState([]);
  const [selection, setSelection] = useState({
    vehicle: null,
    service: null,
    garage: null,
    date: nextDates()[0].value,
    slot: null,
  });
  const [note, setNote] = useState("");
  const [paymentMethod, setPaymentMethod] = useState("CASH");
  const [promotion, setPromotion] = useState(null);
  const [loading, setLoading] = useState(true);
  const [slotLoading, setSlotLoading] = useState(false);
  const [loadError, setLoadError] = useState("");
  const [submitError, setSubmitError] = useState("");
  const [submitting, setSubmitting] = useState(false);
  const [result, setResult] = useState(null);
  const [usingMockData, setUsingMockData] = useState(demoMode);

  const loadFoundationData = useCallback(async () => {
    setLoading(true);
    setLoadError("");
    const fallbackVehicles = state.vehicles
      .map((item) =>
        normalizeVehicle({
          ...item,
          licensePlate: item.licensePlate || item.plate,
          brand: item.brand || item.name?.split(" ")[0],
          model: item.model || item.name?.split(" ").slice(1).join(" "),
        }),
      )
      .filter((item) => item.status === "ACTIVE");
    const fallbackServices = state.services
      .map((item) => normalizeService({ ...item, isMock: true }))
      .filter((item) => item.status === "ACTIVE");
    const fallbackGarages = [];

    if (demoMode) {
      setUsingMockData(true);
      setVehicles(fallbackVehicles);
      setServices(fallbackServices);
      setGarages(fallbackGarages);
      setLoading(false);
      return;
    }

    try {
      const [vehicleResult, serviceResult, garageResult] =
        await Promise.allSettled([
        vehicleApi.getMyVehicles(),
        servicePackageApi.getAll(),
        garageApi.getAll(),
      ]);

      const apiVehicles =
        vehicleResult.status === "fulfilled"
          ? asList(vehicleResult.value)
              .map(normalizeVehicle)
              .filter((item) => item.status === "ACTIVE")
          : fallbackVehicles;
      const apiServices =
        serviceResult.status === "fulfilled"
          ? asList(serviceResult.value)
              .map(normalizeService)
              .filter((item) => item.status === "ACTIVE")
          : fallbackServices;
      const apiGarages =
        garageResult.status === "fulfilled"
          ? asList(garageResult.value)
              .map(normalizeGarage)
              .filter((item) => item.status === "ACTIVE")
          : fallbackGarages;

      setUsingMockData(
        serviceResult.status === "rejected" ||
          garageResult.status === "rejected",
      );
      setVehicles(apiVehicles);
      setServices(apiServices);
      setGarages(apiGarages);

      if (!apiVehicles.length && !apiServices.length && !apiGarages.length) {
        setLoadError("Không thể tải dữ liệu đặt lịch.");
      }
    } finally {
      setLoading(false);
    }
  }, [demoMode, state.garages, state.services, state.vehicles]);

  useEffect(() => {
    loadFoundationData();
  }, [loadFoundationData]);

  const compatibleGarages = useMemo(() => {
    if (!selection.service?.garageId) return garages;
    return garages.filter(
      (garage) =>
        String(getGarageId(garage)) === String(selection.service.garageId),
    );
  }, [garages, selection.service]);

  useEffect(() => {
    if (!selection.garage || !selection.date) {
      setSlots([]);
      return;
    }
    let active = true;
    async function loadSlots() {
      const garageId = getGarageId(selection.garage);
      setSlotLoading(true);
      setSelection((current) => ({ ...current, slot: null }));
      if (!garageId) {
        setSlots([]);
        setSlotLoading(false);
        return;
      }
      try {
        if (demoMode || selection.garage.isMock) {
          setUsingMockData(true);
          if (active) setSlots([]);
          return;
        }
        const data = await bookingSlotApi.getAvailable({
          garageId,
          date: selection.date,
        });
        const normalized = asList(data)
          .map(normalizeSlot)
          .filter(
            (slot) =>
              !slot.garageId || String(slot.garageId) === String(garageId),
          );
        if (active) setSlots(normalized);
      } catch {
        if (active) {
          setUsingMockData(true);
          setSlots([]);
        }
      } finally {
        if (active) setSlotLoading(false);
      }
    }
    loadSlots();
    return () => {
      active = false;
    };
  }, [demoMode, selection.date, selection.garage]);

  function selectService(service) {
    setSelection((current) => ({
      ...current,
      service,
      garage:
        service.garageId &&
        String(getGarageId(current.garage)) !== String(service.garageId)
          ? null
          : current.garage,
      slot: null,
    }));
  }

  function canContinue() {
    if (step === 1) return Boolean(selection.vehicle);
    if (step === 2) return Boolean(selection.service);
    if (step === 3) return Boolean(selection.garage);
    if (step === 4) return Boolean(selection.date && selection.slot && !selection.slot.disabled);
    return true;
  }

  function goNext() {
    setSubmitError("");
    if (!canContinue()) {
      setSubmitError("Vui lòng chọn đầy đủ thông tin đặt lịch.");
      return;
    }
    setStep((current) => Math.min(current + 1, 5));
  }

  async function createBooking() {
    if (!selection.vehicle || !selection.service || !selection.garage || !selection.slot) {
      setSubmitError("Vui lòng chọn đầy đủ thông tin đặt lịch.");
      return;
    }
    const bookingDate = normalizeBookingDate(
      selection.slot.slotDate || selection.date,
    );
    if (!bookingDate) {
      setSubmitError("Vui lòng chọn ngày đặt lịch");
      return;
    }
    const garageId = getGarageId(selection.garage);
    if (!garageId) {
      setSubmitError(
        "Không tìm thấy gara hợp lệ. Vui lòng tải lại danh sách gara.",
      );
      return;
    }
    if (selection.slot.disabled) {
      setSubmitError("Khung giờ này đã đầy.");
      return;
    }
    setSubmitting(true);
    setSubmitError("");

    let discountAmount = 0;
    if (promotion && selection.service?.price) {
      if (promotion.discountType === "PERCENT") {
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
      paymentMethod,
      discountAmount,
      bookingNote: (note.trim() + (promotion ? ` [Mã ưu đãi: ${promotion.code} - Giảm ${discountAmount}đ]` : "")).trim(),
    };
    try {
      let response;
      if (demoMode) {
        response = actions.createBooking({
          ...payload,
          garageName: selection.garage.name,
          vehicle: `${selection.vehicle.brand} ${selection.vehicle.model}`.trim(),
          plate: selection.vehicle.licensePlate,
          serviceName: selection.service.name,
          bookingDate,
          slotTime: selection.slot.startTime,
          amount: selection.service.price,
          discount: discountAmount,
          finalAmount: Math.max(0, selection.service.price - discountAmount),
          note: payload.bookingNote,
        });
      } else {
        response = await bookingApi.createBooking(payload);
      }
      const normalizedResult = normalizeBookingResponse(response);
      const isDemoResult = demoMode || usingMockData;
      setResult({
        ...normalizedResult,
        paymentId:
          normalizedResult.paymentId ||
          (isDemoResult ? normalizedResult.bookingId : null),
        isDemo: isDemoResult,
      });
      setStep(6);
    } catch (error) {
      const isDemoFlow =
        usingMockData ||
        selection.garage?.isMock ||
        selection.service?.isMock ||
        selection.slot?.isMock;
      if (isDemoFlow) {
        const demoBooking = actions.createBooking({
          ...payload,
          garageName: selection.garage.name,
          vehicle: `${selection.vehicle.brand} ${selection.vehicle.model}`.trim(),
          plate: selection.vehicle.licensePlate,
          serviceName: selection.service.name,
          bookingDate,
          slotTime: selection.slot.startTime,
          amount: selection.service.price,
          discount: discountAmount,
          finalAmount: Math.max(0, selection.service.price - discountAmount),
          note: payload.bookingNote,
        });
        setResult({
          bookingId: demoBooking.id,
          bookingCode: demoBooking.code,
          paymentId: demoBooking.id,
          bookingStatus: "PENDING",
          paymentStatus: "PENDING",
          isDemo: true,
        });
        setStep(6);
      } else {
        setSubmitError(bookingErrorMessage(error));
      }
    } finally {
      setSubmitting(false);
    }
  }

  function content() {
    if (loading) return <StepLoading />;
    if (loadError) return <StepError message={loadError} onRetry={loadFoundationData} />;
    if (step === 1) return <VehicleStep vehicles={vehicles} selectedId={selection.vehicle?.id} onSelect={(vehicle) => setSelection((current) => ({ ...current, vehicle }))} />;
    if (step === 2) return <ServiceStep services={services} selectedId={selection.service?.id} onSelect={selectService} />;
    if (step === 3) return <GarageStep garages={compatibleGarages} selectedId={getGarageId(selection.garage)} onSelect={(garage) => setSelection((current) => ({ ...current, garage, slot: null }))} />;
    if (step === 4) return <SlotStep date={selection.date} onDateChange={(date) => setSelection((current) => ({ ...current, date, slot: null }))} slots={slots} selectedId={selection.slot?.id} onSelect={(slot) => setSelection((current) => ({ ...current, slot }))} loading={slotLoading} />;
    if (step === 5) return <BookingReviewStep selection={selection} note={note} onNoteChange={setNote} paymentMethod={paymentMethod} onPaymentMethodChange={setPaymentMethod} promotion={promotion} onSelectPromotion={setPromotion} />;
    return <BookingSuccessStep result={result} selection={selection} />;
  }

  return (
    <div className="space-y-7">
      <header className="flex flex-col gap-5 sm:flex-row sm:items-end sm:justify-between">
        <div>
          <p className="text-sm font-extrabold uppercase tracking-[0.18em] text-[var(--brand-blue)]">Đặt lịch thông minh</p>
          <h1 className="mt-2 text-3xl font-extrabold tracking-tight sm:text-4xl">Đặt lịch rửa xe</h1>
          <p className="mt-3 max-w-2xl text-sm leading-6 text-[var(--text-muted)]">Chọn xe, dịch vụ, gara và khung giờ phù hợp để tạo lịch rửa xe thông minh.</p>
        </div>
        <Link to="/customer/dashboard" className="inline-flex items-center gap-2 self-start rounded-2xl border border-[var(--border-soft)] bg-white px-4 py-3 text-sm font-bold text-[var(--text-main)] shadow-sm"><ArrowLeft size={17} /> Quay lại trang khách hàng</Link>
      </header>
      <BookingStepper currentStep={step} />
      {usingMockData && step < 6 && (
        <div className="flex flex-col gap-2 rounded-2xl border border-blue-200 bg-blue-50 px-5 py-4 text-sm text-blue-700 sm:flex-row sm:items-center sm:justify-between">
          <span className="w-fit rounded-full bg-white px-3 py-1 text-xs font-extrabold text-[var(--brand-blue)]">
            Dữ liệu mẫu
          </span>
          <p>Dữ liệu này dùng để demo giao diện. API thật sẽ được kết nối sau.</p>
        </div>
      )}
      {submitError && <div role="alert" className="rounded-2xl border border-red-200 bg-red-50 px-5 py-4 text-sm font-semibold text-red-700">{submitError}</div>}
      {content()}
      {step < 6 && !loading && !loadError && (
        <div className="flex flex-col-reverse justify-between gap-3 border-t border-[var(--border-soft)] pt-6 sm:flex-row">
          <button type="button" onClick={() => setStep((current) => Math.max(1, current - 1))} disabled={step === 1 || submitting} className="inline-flex items-center justify-center gap-2 rounded-2xl border border-[var(--border-soft)] bg-white px-6 py-3 font-bold text-[var(--text-main)] disabled:cursor-not-allowed disabled:opacity-40"><ArrowLeft size={18} /> Quay lại</button>
          {step < 5 ? (
            <button type="button" onClick={goNext} className="inline-flex items-center justify-center gap-2 rounded-2xl bg-[var(--brand-blue)] px-6 py-3 font-bold text-white shadow-[0_12px_28px_-10px_rgba(11,140,255,.75)]">Tiếp tục <ArrowRight size={18} /></button>
          ) : (
            <button type="button" onClick={createBooking} disabled={submitting} className="inline-flex items-center justify-center gap-2 rounded-2xl bg-[var(--brand-blue)] px-6 py-3 font-bold text-white shadow-[0_12px_28px_-10px_rgba(11,140,255,.75)] disabled:opacity-60">{submitting ? "Đang tạo lịch đặt..." : "Tạo lịch đặt"} <ArrowRight size={18} /></button>
          )}
        </div>
      )}
    </div>
  );
}
